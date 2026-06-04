import "../styles/cards.css";

export default function TestimonialCard({ testimonial }) {
  return (
    <div className="testimonial-card">
      <div className="quote-mark">"</div>
      <p className="testimonial-text">{testimonial.text}</p>
      <div className="testimonial-footer">
        <div className="avatar" style={{ background: testimonial.color, width: 44, height: 44, fontSize: "0.9rem" }}>
          {testimonial.avatar}
        </div>
        <div className="testimonial-info">
          <strong>{testimonial.name}</strong>
          <span>📍 {testimonial.city}</span>
        </div>
        <span className="stars" style={{ marginLeft: "auto" }}>
          {"★".repeat(testimonial.note)}
        </span>
      </div>
    </div>
  );
}
