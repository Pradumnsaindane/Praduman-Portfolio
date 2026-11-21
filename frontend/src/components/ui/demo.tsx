import ThermodynamicGrid from "@/components/ui/interactive-thermodynamic-grid";

export default function ThermalDemo() {
  return (
    <div className="relative w-full h-screen font-sans bg-[#050505] text-white">
      {/* BACKGROUND: High Resolution Heatmap */}
      <ThermodynamicGrid 
        resolution={12} // Finer detail
        coolingFactor={0.96} // Long heat trails
      />
    </div>
  );
}
