export function OrderRevisionSummary({
  originalTotal,
  revisedTotal,
  balanceAdjustment,
}: {
  originalTotal: number;
  revisedTotal: number;
  balanceAdjustment: number;
}) {
  const refundOwed = balanceAdjustment < -0.005;
  const balanceDue = balanceAdjustment > 0.005;

  return (
    <div className="rounded-md border border-[#e4e1dc] bg-white p-4">
      <div className="mb-2 text-[13px] font-bold tracking-wide text-[#9a9490] uppercase">Revision Summary</div>
      <div className="flex justify-between py-0.5 text-[14px]">
        <span className="text-[#9a9490]">Original total</span>
        <span className="font-semibold text-[#1a1816]">${originalTotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between border-t border-[#e4e1dc] py-1.5 pt-2 text-[14px]">
        <span className="font-bold text-[#1a1816]">Revised total</span>
        <span className="font-[family-name:var(--font-plex-mono)] font-bold text-[#c04535]">
          ${revisedTotal.toFixed(2)}
        </span>
      </div>
      {(refundOwed || balanceDue) && (
        <div
          className={`mt-2 rounded px-2.5 py-1.5 text-[13px] font-bold ${
            refundOwed ? "bg-[#e6f4ea] text-[#1e8a4a]" : "bg-[#fdf3e0] text-[#9a6d00]"
          }`}
        >
          {refundOwed
            ? `$${Math.abs(balanceAdjustment).toFixed(2)} refund owed to customer`
            : `$${Math.abs(balanceAdjustment).toFixed(2)} due from customer`}
        </div>
      )}
    </div>
  );
}
