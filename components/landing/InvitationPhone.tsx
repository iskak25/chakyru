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
      <div className="invite-phone-bezel">
        <span className="invite-phone-island" />
        <div className="invite-phone-screen">{children}</div>
      </div>
    </div>
  );
}
