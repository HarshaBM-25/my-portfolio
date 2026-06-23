export default function Infobox({ profile }) {
  if (!profile) return null;
  const interests = profile.interests || [];

  return (
    <aside className="w-full border border-[var(--wiki-border)] bg-[var(--wiki-panel)] text-sm">
      <div className="bg-[var(--wiki-infobox)] text-center font-bold text-base px-2 py-2 border-b border-[var(--wiki-border)]">
        {profile.name || 'Untitled'}
      </div>

      {profile.photo_url ? (
        <div className="border-b border-[var(--wiki-border)] p-2 flex justify-center bg-[var(--wiki-bg)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.photo_url}
            alt={profile.name}
            className="max-h-56 w-full object-cover"
          />
        </div>
      ) : (
        <div className="border-b border-[var(--wiki-border)] p-6 flex justify-center bg-[var(--wiki-bg)] text-[var(--wiki-subtle)] text-xs italic">
          No photo set — add one from /admin
        </div>
      )}

      <table className="w-full border-collapse">
        <tbody>
          <InfoRow label="Born" value={profile.dob} />
          <InfoRow label="Education" value={profile.education} />
          <InfoRow label="Location" value={profile.location} />
          <InfoRow label="Occupation" value={profile.occupation} />
          <InfoRow label="Interests" value={interests.length ? interests.join(', ') : ''} />
        </tbody>
      </table>
    </aside>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <tr className="border-t border-[var(--wiki-border)] align-top">
      <th className="text-left font-semibold px-2 py-1.5 w-[38%] bg-[var(--wiki-panel)]">{label}</th>
      <td className="px-2 py-1.5">{value}</td>
    </tr>
  );
}
