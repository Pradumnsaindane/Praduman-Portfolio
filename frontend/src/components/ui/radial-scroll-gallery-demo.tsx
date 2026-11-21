'use client';

import { RadialScrollGallery } from '@/components/ui/portfolio-and-image-gallery';
import { Check } from 'lucide-react';

const steps = [
  { step: "01", title: "Discovery", desc: "Requirements" },
  { step: "02", title: "Strategy", desc: "Roadmap" },
  { step: "03", title: "Design", desc: "Interface" },
  { step: "04", title: "Build", desc: "Development" },
  { step: "05", title: "Launch", desc: "Deployment" },
];

export default function DemoRadialScrollGalleryBasic() {
  return (
    <div className="relative bg-background font-sans text-foreground overflow-hidden rounded-lg border w-full">
      {/* Header Section */}
      <div className="h-[300px] flex items-center justify-center px-4 pt-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
             Workflow
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            The Process
          </h1>
          <p className="text-muted-foreground text-sm max-w-[300px] mx-auto">
            Scroll down to see the steps.
          </p>
        </div>
      </div>

      <RadialScrollGallery
        className="!min-h-[600px]"
        baseRadius={350}
        mobileRadius={220}
        scrollDuration={1500}
        visiblePercentage={40}
      >
        {(hoveredIndex) =>
          steps.map((item, index) => {
            const isActive = hoveredIndex === index;
            return (
              <div
                key={index}
                className={`
                  w-[160px] h-[240px] sm:w-[200px] sm:h-[280px] 
                  rounded-xl border p-5 flex flex-col justify-between items-start 
                  transition-all duration-500 shadow-sm
                  ${isActive 
                    ? 'bg-primary border-primary text-primary-foreground scale-100 shadow-xl' 
                    : 'bg-card border-border text-card-foreground scale-90 opacity-60'
                  }
                `}
              >
                <div className="w-full flex justify-between items-start">
                  <span className={`font-mono text-lg ${isActive ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {item.step}
                  </span>
                  {isActive && <Check className="w-5 h-5 text-primary-foreground" />}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <p className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })
        }
      </RadialScrollGallery>

      <div className="h-[300px] flex items-center justify-center bg-muted/20 border-t border-border">
        <p className="text-muted-foreground text-sm">End of Workflow</p>
      </div>
    </div>
  );
}
