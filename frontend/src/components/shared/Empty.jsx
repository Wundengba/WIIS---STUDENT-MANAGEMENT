import { InboxIcon } from '@heroicons/react/24/outline';
import { S } from './styles';

export function Empty({ text }) {
  return (
    <div style={{ textAlign:"center", padding:"36px 20px", color:"#94a3b8" }}>
      <InboxIcon className="h-9 w-9 mx-auto mb-2" style={{ color: S.colors.muted }}/>
      <div style={{ fontSize:13 }}>{text}</div>
    </div>
  );
}
