import BackgroundGlow from "@/components/BackgroundGlow";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardPreview } from "@/components/DashboardPreview";
import heroImg from "@/assets/finai-hero.jpg";
import { BarChart3, LineChart as LineChartIcon, BellRing } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundGlow />
      <header className="relative z-10">
        <nav className="container flex items-center justify-between py-6">
          <a href="#home" className="flex items-center gap-2 font-semibold">
            <span>FinAI Advisor</span>
          </a>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <a href="#features">Features</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#preview">Live Preview</a>
            </Button>
            <Button variant="hero" asChild>
              <a href="#get-started">Get Started</a>
            </Button>
          </div>
        </nav>
      </header>

      <main id="home" className="relative z-10">
        <section className="container grid gap-10 md:grid-cols-2 items-center py-12 md:py-20">
          <div className="space-y-6 section-fade">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              AI Financial Analytics for SMEs
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Centralize your bank, accounting, and payments data. Get real-time dashboards, anomaly alerts, and accurate forecasts to make faster decisions.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="hero" size="lg">Start Free Trial</Button>
              <Button variant="outline" size="lg">Book a Demo</Button>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><LineChartIcon className="opacity-80" /> Forecasting</div>
              <div className="flex items-center gap-2"><BarChart3 className="opacity-80" /> Insights</div>
              <div className="flex items-center gap-2"><BellRing className="opacity-80" /> Alerts</div>
            </div>
          </div>

          <div className="relative section-fade" aria-hidden>
            <img src={heroImg} alt="FinAI Advisor dashboard hero with charts and analytics" loading="lazy" className="rounded-xl border shadow-soft w-full" />
          </div>
        </section>

        <section id="features" className="container py-8 md:py-14 section-fade">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 shadow-soft">
              <h3 className="text-xl font-semibold mb-2">Expenditure Analysis</h3>
              <p className="text-muted-foreground">AI categorizes spend and flags inefficiencies to help you stay on budget.</p>
            </Card>
            <Card className="p-6 shadow-soft">
              <h3 className="text-xl font-semibold mb-2">Investments & Returns</h3>
              <p className="text-muted-foreground">Track ROI, yields, and diversification with clear, actionable metrics.</p>
            </Card>
            <Card className="p-6 shadow-soft">
              <h3 className="text-xl font-semibold mb-2">Anomaly Detection</h3>
              <p className="text-muted-foreground">Automatic alerts for unusual spikes or dips with suggested root causes.</p>
            </Card>
          </div>
        </section>

        <section id="preview" className="container py-8 md:py-14">
          <DashboardPreview />
        </section>
      </main>

      <footer className="relative z-10 border-t">
        <div className="container py-8 text-sm text-muted-foreground flex items-center justify-between">
          <span>© {new Date().getFullYear()} FinAI Advisor</span>
          <a href="#get-started" className="underline underline-offset-4">Get Started</a>
        </div>
      </footer>
    </div>
  );
};

export default Index;
