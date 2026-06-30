const bookingRepo = require("../repositories/bookingRepository");
const providerRepo = require("../repositories/providerRepository");
const userRepo = require("../repositories/userRepository");
const chatRepo = require("../repositories/chatRepository");
const dispoRepo = require("../repositories/disponibiliteRepository");
const commissionService = require("./commissionService");
const notifService = require("./notificationService");
const { sendMail } = require("../config/mailer");
const tpl = require("../config/emailTemplates");
const db = require("../config/db");

const create = async (client_id, data) => {
  let provider = null;
  if (data.provider_id) {
    provider = await providerRepo.findById(data.provider_id);
    if (!provider) throw Object.assign(new Error("Prestataire introuvable."), { status: 404 });
    if (!provider.available) throw Object.assign(new Error("Ce prestataire n'est pas disponible."), { status: 409 });

    if (data.slot && data.date) {
      const taken = await dispoRepo.isSlotTaken(provider.id, data.date, data.slot);
      if (taken) throw Object.assign(new Error("Ce créneau n'est plus disponible."), { status: 409 });
    }
  }

  let commissionData = {};
  if (data.provider_id && data.montant_ht) {
    const calc = await commissionService.calculerPourBooking(data.provider_id, parseFloat(data.montant_ht));
    commissionData = {
      montant_ht:         calc.montantHT,
      taux_commission:    calc.taux,
      montant_commission: calc.montantCommission,
      montant_net:        calc.montantNet,
    };
  }

  const booking = await bookingRepo.create({ client_id, ...data, ...commissionData });
  const client  = await userRepo.findById(client_id);
  const dateStr = new Date(booking.date).toLocaleDateString("fr-FR");
  const ref     = booking.id.slice(0, 8).toUpperCase();

  // ── Email confirmation client ─────────────────────────────────────────
  if (client?.email) {
    sendMail({
      to: client.email,
      subject: "Votre réservation Prestalya est enregistrée",
      html: tpl.bookingConfirmation({ prenom: client.prenom, service: booking.service, date: dateStr, slot: booking.slot, ref }),
    }).catch(() => {});
  }

  if (provider) {
    // ── Prestataire choisi → créneau en attente, notif + email (pas de chat tant que non accepté) ──
    if (data.slot && data.date) {
      await dispoRepo.setSlotStatus(provider.id, data.date, data.slot, "en_attente", booking.id);
    }
    notifService.push(provider.user_id, {
      type: "new_booking", title: "Nouvelle demande de réservation",
      body: `Un client souhaite réserver votre service "${booking.service}". Acceptez, refusez ou proposez un autre créneau.`,
      link: "/prestataire?tab=demandes",
    }).catch(() => {});

    const providerUser = await userRepo.findById(provider.user_id);
    if (providerUser?.email) {
      sendMail({
        to: providerUser.email,
        subject: "Nouvelle demande de réservation sur Prestalya",
        html: tpl.newBookingProvider({ prenomProvider: providerUser.prenom, prenomClient: client?.prenom || "Un client", service: booking.service, date: dateStr, slot: booking.slot }),
      }).catch(() => {});
    }
  } else {
    // ── Au choix de Prestalya → notifier TOUS les prestataires du service ─
    const [allProviders] = await db.query(
      `SELECT p.*, u.email, u.prenom FROM providers p
       JOIN users u ON u.id = p.user_id
       WHERE p.available = 1 AND p.service LIKE ?`,
      [`%${booking.service}%`]
    );

    allProviders.forEach(p => {
      notifService.push(p.user_id, {
        type: "new_booking_open",
        title: "Nouvelle demande disponible",
        body: `Un client cherche un prestataire pour "${booking.service}" le ${dateStr}. Acceptez-la !`,
        link: "/prestataire?tab=demandes",
      }).catch(() => {});

      if (p.email) {
        sendMail({
          to: p.email,
          subject: `Nouvelle demande "${booking.service}" disponible`,
          html: tpl.newBookingProvider({
            prenomProvider: p.prenom,
            prenomClient: "Un client",
            service: booking.service,
            date: dateStr,
            slot: booking.slot,
          }),
        }).catch(() => {});
      }
    });
  }

  return booking;
};

const myBookings = async (user_id, role, provider_profile_id) => {
  if (role === "client") return bookingRepo.findByClient(user_id);
  if (role === "prestataire" && provider_profile_id) return bookingRepo.findByProvider(provider_profile_id);
  return [];
};

// Réservations sans prestataire pour un service donné
const getOpenBookings = async (service) => {
  const [rows] = await db.query(
    `SELECT b.*, CONCAT(u.prenom,' ',u.nom) AS client_name
     FROM bookings b
     JOIN users u ON u.id = b.client_id
     WHERE b.provider_id IS NULL AND b.status = 'en_attente' AND b.service LIKE ?
     ORDER BY b.created_at DESC`,
    [`%${service}%`]
  );
  return rows;
};

const notifyClientEmail = async (booking, status) => {
  const client = await userRepo.findById(booking.client_id).catch(() => null);
  if (!client?.email) return;
  sendMail({
    to: client.email,
    subject: {
      accepte:  "Votre demande a été acceptée ✅",
      refuse:   "Votre demande a été refusée",
      propose:  "Nouveau créneau proposé",
      confirme: "Réservation confirmée ✅",
      annule:   "Réservation annulée",
      termine:  "Prestation terminée 🎉",
    }[status] || "Mise à jour de votre réservation",
    html: tpl.bookingStatusUpdate({ prenom: client.prenom, service: booking.service, status, date: new Date(booking.date).toLocaleDateString("fr-FR") }),
  }).catch(() => {});
};

// Prestataire accepte une réservation ouverte (sans prestataire choisi au départ)
const acceptOpenBooking = async (booking_id, provider_user_id) => {
  const booking = await bookingRepo.findById(booking_id);
  if (!booking) throw Object.assign(new Error("Réservation introuvable."), { status: 404 });
  if (booking.provider_id) throw Object.assign(new Error("Cette réservation a déjà été acceptée."), { status: 409 });

  const provider = await providerRepo.findByUserId(provider_user_id);
  if (!provider) throw Object.assign(new Error("Profil prestataire introuvable."), { status: 404 });

  if (booking.slot && booking.date) {
    const taken = await dispoRepo.isSlotTaken(provider.id, booking.date, booking.slot);
    if (taken) throw Object.assign(new Error("Ce créneau n'est plus disponible dans votre agenda."), { status: 409 });
  }

  const updated = await bookingRepo.setProvider(booking_id, provider.id, "accepte");
  if (booking.slot && booking.date) {
    await dispoRepo.setSlotStatus(provider.id, booking.date, booking.slot, "reserve", booking_id);
  }

  notifService.push(booking.client_id, {
    type: "booking_accepted", title: "Prestataire trouvé !",
    body: `Un prestataire a accepté votre demande pour "${booking.service}". Confirmez la prestation.`,
    link: "/dashboard",
  }).catch(() => {});
  await notifyClientEmail(updated, "accepte");

  // Le chat s'ouvre dès l'acceptation
  const conv = await chatRepo.findOrCreateConversation(booking.client_id, provider_user_id, booking_id).catch(() => null);

  return { ...updated, conv_id: conv?._id?.toString() || null };
};

// Prestataire accepte une demande qui lui était directement adressée
const acceptBooking = async (booking_id, provider_user_id) => {
  const booking = await bookingRepo.findById(booking_id);
  if (!booking) throw Object.assign(new Error("Réservation introuvable."), { status: 404 });

  const provider = await providerRepo.findByUserId(provider_user_id);
  if (!provider || booking.provider_id !== provider.id)
    throw Object.assign(new Error("Non autorisé."), { status: 403 });
  if (booking.status !== "en_attente")
    throw Object.assign(new Error("Cette demande n'est plus en attente."), { status: 409 });

  const updated = await bookingRepo.updateStatus(booking_id, "accepte");
  if (booking.slot && booking.date) {
    await dispoRepo.setSlotStatus(provider.id, booking.date, booking.slot, "reserve", booking_id);
  }

  notifService.push(booking.client_id, {
    type: "booking_accepted", title: "Demande acceptée !",
    body: `Votre demande pour "${booking.service}" a été acceptée. Confirmez la prestation.`,
    link: "/dashboard",
  }).catch(() => {});
  await notifyClientEmail(updated, "accepte");

  const conv = await chatRepo.findOrCreateConversation(booking.client_id, provider_user_id, booking_id).catch(() => null);

  return { ...updated, conv_id: conv?._id?.toString() || null };
};

// Prestataire refuse une demande qui lui était directement adressée
const refuseBooking = async (booking_id, provider_user_id) => {
  const booking = await bookingRepo.findById(booking_id);
  if (!booking) throw Object.assign(new Error("Réservation introuvable."), { status: 404 });

  const provider = await providerRepo.findByUserId(provider_user_id);
  if (!provider || booking.provider_id !== provider.id)
    throw Object.assign(new Error("Non autorisé."), { status: 403 });
  if (!["en_attente", "propose"].includes(booking.status))
    throw Object.assign(new Error("Cette demande ne peut plus être refusée."), { status: 409 });

  const updated = await bookingRepo.updateStatus(booking_id, "refuse");
  if (booking.slot && booking.date) {
    await dispoRepo.freeSlot(provider.id, booking.date, booking.slot);
  }

  notifService.push(booking.client_id, {
    type: "booking_refused", title: "Demande refusée",
    body: `Votre demande pour "${booking.service}" a été refusée par le prestataire.`,
    link: "/dashboard",
  }).catch(() => {});
  await notifyClientEmail(updated, "refuse");

  return updated;
};

// Prestataire propose un autre créneau
const proposeAlternative = async (booking_id, provider_user_id, propose_date, propose_slot) => {
  if (!propose_date || !propose_slot)
    throw Object.assign(new Error("Date et créneau requis."), { status: 400 });

  const booking = await bookingRepo.findById(booking_id);
  if (!booking) throw Object.assign(new Error("Réservation introuvable."), { status: 404 });

  const provider = await providerRepo.findByUserId(provider_user_id);
  if (!provider || booking.provider_id !== provider.id)
    throw Object.assign(new Error("Non autorisé."), { status: 403 });
  if (booking.status !== "en_attente")
    throw Object.assign(new Error("Cette demande n'est plus en attente."), { status: 409 });

  const taken = await dispoRepo.isSlotTaken(provider.id, propose_date, propose_slot);
  if (taken) throw Object.assign(new Error("Ce créneau n'est pas disponible dans votre agenda."), { status: 409 });

  const updated = await bookingRepo.setProposal(booking_id, propose_date, propose_slot);

  notifService.push(booking.client_id, {
    type: "booking_proposed", title: "Nouveau créneau proposé",
    body: `Le prestataire vous propose un autre créneau pour "${booking.service}".`,
    link: "/dashboard",
  }).catch(() => {});
  await notifyClientEmail(updated, "propose");

  return updated;
};

// Client répond à une proposition de créneau
const respondProposal = async (booking_id, client_id, accept) => {
  const booking = await bookingRepo.findById(booking_id);
  if (!booking) throw Object.assign(new Error("Réservation introuvable."), { status: 404 });
  if (booking.client_id !== client_id) throw Object.assign(new Error("Non autorisé."), { status: 403 });
  if (booking.status !== "propose") throw Object.assign(new Error("Aucune proposition en attente."), { status: 409 });

  const provider = await providerRepo.findById(booking.provider_id);

  if (!accept) {
    const updated = await bookingRepo.updateStatus(booking_id, "refuse");
    if (provider) await dispoRepo.freeSlot(provider.id, booking.date, booking.slot);
    return updated;
  }

  // Le créneau initial est libéré, le nouveau devient réservé
  if (provider) {
    await dispoRepo.freeSlot(provider.id, booking.date, booking.slot);
    await dispoRepo.setSlotStatus(provider.id, booking.propose_date, booking.propose_slot, "reserve", booking_id);
  }
  const updated = await bookingRepo.acceptProposal(booking_id);

  if (provider) {
    notifService.push(provider.user_id, {
      type: "proposal_accepted", title: "Créneau accepté",
      body: `Le client a accepté le nouveau créneau pour "${booking.service}".`,
      link: "/prestataire",
    }).catch(() => {});
    await chatRepo.findOrCreateConversation(client_id, provider.user_id, booking_id).catch(() => {});
  }

  return updated;
};

// Client confirme définitivement la prestation après acceptation du prestataire
const confirmBooking = async (booking_id, client_id) => {
  const booking = await bookingRepo.findById(booking_id);
  if (!booking) throw Object.assign(new Error("Réservation introuvable."), { status: 404 });
  if (booking.client_id !== client_id) throw Object.assign(new Error("Non autorisé."), { status: 403 });
  if (booking.status !== "accepte") throw Object.assign(new Error("Cette réservation ne peut pas encore être confirmée."), { status: 409 });

  const updated = await bookingRepo.updateStatus(booking_id, "confirme");

  if (booking.provider_id) {
    notifService.push((await providerRepo.findById(booking.provider_id))?.user_id, {
      type: "booking_confirmed", title: "Prestation confirmée",
      body: `Le client a confirmé la prestation "${booking.service}".`,
      link: "/prestataire",
    }).catch(() => {});
  }
  await notifyClientEmail(updated, "confirme");

  return updated;
};

const updateStatus = async (booking_id, user_id, role, status) => {
  const booking = await bookingRepo.findById(booking_id);
  if (!booking) throw Object.assign(new Error("Réservation introuvable."), { status: 404 });

  if (role === "client" && booking.client_id !== user_id)
    throw Object.assign(new Error("Non autorisé."), { status: 403 });

  const allowed = role === "client" ? ["annule"] : ["termine", "annule"];
  if (!allowed.includes(status))
    throw Object.assign(new Error("Statut non autorisé."), { status: 403 });

  const updated = await bookingRepo.updateStatus(booking_id, status);

  if (["annule"].includes(status) && booking.provider_id && booking.slot && booking.date) {
    const provider = await providerRepo.findById(booking.provider_id);
    if (provider) await dispoRepo.freeSlot(provider.id, booking.date, booking.slot);
  }

  const notifMap = {
    annule:  { clientTitle: "Réservation annulée",  clientBody: `Votre réservation "${booking.service}" a été annulée.`,              clientLink: "/dashboard" },
    termine: { clientTitle: "Prestation terminée",  clientBody: `Votre prestation "${booking.service}" est terminée. Laissez un avis !`, clientLink: "/dashboard" },
  };
  if (notifMap[status]) {
    const n = notifMap[status];
    notifService.push(booking.client_id, { type: status, title: n.clientTitle, body: n.clientBody, link: n.clientLink }).catch(() => {});
  }

  if (status === "termine") {
    if (booking.provider_id) await commissionService.upgradeNiveauAuto(booking.provider_id).catch(() => {});
  }

  await notifyClientEmail(updated, status);

  return updated;
};

module.exports = {
  create, myBookings, updateStatus, getOpenBookings, acceptOpenBooking,
  acceptBooking, refuseBooking, proposeAlternative, respondProposal, confirmBooking,
};
