const STEPS = [
  {
    title: "Order confirmed via WhatsApp",
    desc: "You'll receive a confirmation message with your order summary within a few minutes.",
  },
  {
    title: "Prepared and packed",
    desc: "Your order is cut, weighed, and packed to your specifications. Any substitutions are flagged before dispatch.",
  },
  {
    title: "Dispatched for delivery",
    desc: "Driver's name and ETA sent to your WhatsApp on the morning of delivery.",
  },
];

export function WhatsNextSteps() {
  return (
    <div className="mb-4 text-left">
      <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
        What happens next
      </div>
      <div className="flex flex-col gap-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex items-start gap-3">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[0.68rem] font-extrabold text-primary-600">
              {i + 1}
            </div>
            <div>
              <div className="text-[0.82rem] font-bold text-neutral-900">{step.title}</div>
              <div className="text-[0.76rem] leading-relaxed text-neutral-500">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
