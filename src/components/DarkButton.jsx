import './DarkButton.css';

function DarkButton({
  label = 'JETZT PROTOTYP SICHERN',
  type = 'button',
  className = '',
}) {
  const classes = ['dark-button', className].filter(Boolean).join(' ');

  return (
    <button className={classes} type={type}>
      <span className="dark-button__icon dark-button__icon--left" aria-hidden="true">
        <span className="dark-button__arrow" />
      </span>
      <span className="dark-button__content">
        <span className="dark-button__label">{label}</span>
      </span>
      <span className="dark-button__icon dark-button__icon--right" aria-hidden="true">
        <span className="dark-button__arrow" />
      </span>
    </button>
  );
}

export default DarkButton;
