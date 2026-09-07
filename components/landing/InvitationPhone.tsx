import type { ReactNode } from "react";

export function InvitationPhone({
  children,
  featured = false,
}: {
  children: ReactNode;
  featured?: boolean;
}) {
  return (
    <div className={`invite-phone ${featured ? "invite-phone-featured" : ""}`}>
      <span className="invite-phone-btn invite-phone-btn-silent" />
      <span className="invite-phone-btn invite-phone-btn-vol-up" />
      <span className="invite-phone-btn invite-phone-btn-vol-down" />
      <span className="invite-phone-btn invite-phone-btn-power" />
      <div className="invite-phone-shell">
        <div className="invite-phone-bezel">
          <span className="invite-phone-island" />
          <div className="invite-phone-screen">{children}</div>
          <span className="invite-phone-home" />
        </div>
      </div>
    </div>
  );
}
