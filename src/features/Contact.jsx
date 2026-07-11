

export default function ContactPage() {
  return (
    <section className="contact">
      <div className="contact-container">

        <div className="contact-info">
          <h2>Get in Touch</h2>

          <p>
            We'd love to hear from you. Whether you have a question,
            feedback, or want to work together, feel free to contact us.
          </p>

          <div className="info-box">
            <h4>📍 Address</h4>
            <p>New Delhi, India</p>
          </div>

          <div className="info-box">
            <h4>📧 Email</h4>
            <p>hello@example.com</p>
          </div>

          <div className="info-box">
            <h4>📞 Phone</h4>
            <p>+91 9876543210</p>
          </div>
        </div>

        <form className="contact-form">
          <h2>Send Message</h2>

          <input type="text" placeholder="Your Name" />

          <input type="email" placeholder="Your Email" />

          <input type="text" placeholder="Subject" />

          <textarea
            rows="6"
            placeholder="Write your message..."
          ></textarea>

          <button type="submit">Send Message</button>
        </form>

      </div>
    </section>
  );
}