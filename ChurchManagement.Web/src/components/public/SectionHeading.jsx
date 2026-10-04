function SectionHeading({ eyebrow, title, description, align = "left" }) {
  return (
    <div className={`section-heading section-heading-${align}`}>
      {eyebrow && (
        <div className="section-eyebrow">
          <span className="section-eyebrow-line" />
          <p>{eyebrow}</p>
        </div>
      )}

      <h2>{title}</h2>

      {description && <p className="section-description">{description}</p>}
    </div>
  );
}

export default SectionHeading;
