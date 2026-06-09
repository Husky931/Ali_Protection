'use client';

export function SortSelect({ currentSort }: { currentSort: string }) {
  return (
    <select
      value={currentSort}
      onChange={(e) => {
        const params = new URLSearchParams(window.location.search);
        params.set('sort', e.target.value);
        window.location.href = `/reports?${params.toString()}`;
      }}
      className="select"
      style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
    >
      <option value="recent">Most recent</option>
      <option value="biggest">Biggest loss</option>
    </select>
  );
}
