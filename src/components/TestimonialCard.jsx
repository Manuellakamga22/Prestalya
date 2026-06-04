import "../styles/cards.css";

export default function TestimonialCard({ testimonial }) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-stars stars">{"★".repeat(testimonial.note)}</div>
      <p className="testimonial-quote">"{testimonial.text}"</p>
      <div className="testimonial-footer">
        <div className="testimonial-avatar" style={{ background: testimonial.color }}>
          {testimonial.avatar}
        </div>
        <div>
          <div className="testimonial-name">{testimonial.name}</div>
          <div className="testimonial-city">📍 {testimonial.city}</div>
        </div>
      </div>
    </div>
  );
}
