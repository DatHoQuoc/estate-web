import { Navbar } from "@/components/layout/navbar";
import { mockStaffUser } from "@/lib/mock-data";
import { LandPlot, MapPinHouse } from "lucide-react";

export default function FullPageLoading() {
  return (
    <div className="min-h-screen bg-background select-none">
      <Navbar  fixed />

      <main className="pt-16 flex items-center justify-center h-screen gap-16">
        <div className="flex-1 grid place-items-end">
          <LandPlot size="90vh" className="max-h-130" strokeWidth={0.25} />
        </div>

        <div className="flex-1 flex flex-col">
          <p className="text-4xl font-bold">Hang on tight !</p>
          <p>We're getting things ready for you</p>.
          <div className="text-sm">
            <div>Fun Fact</div>
            <div>Houses are really cool (even if you don't own one)</div>
          </div>
          <div className="flex items-center gap-8 mt-16">
            <img src="/loading.svg" width={100} />
            <div className="flex-1 border-b"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
