import { styles } from '../theme';

export default function UrgencyBadge({ urgency }) {
  const s = styles.chip(urgency);
  return (
    <span style={{ ...s }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dotColor, display: "inline-block" }} />
      {urgency}
    </span>
  );
}
