import Link from "next/link";

const MandalaPayLogo = () => {
  return (
    <Link className="flex items-center" href="/">
      <div className="flex items-center">
        <span
          className="flex items-center justify-center w-10 h-10 rounded-full"
          style={{ background: "hsl(88 50% 53%)" }}
        >
          <span className="ml-1 text-2xl text-white font-[cursive] italic font-bold tracking-tight">
            M
          </span>
        </span>
        <span className="ml-1 text-2xl text-foreground font-[cursive] italic font-bold tracking-tight">
          andala
        </span>
        <span className="ml-0.5 text-2xl text-green-500 font-[sans-serif] font-semibold tracking-tight">
          Pay
        </span>
      </div>
    </Link>
  );
};

export default MandalaPayLogo;
