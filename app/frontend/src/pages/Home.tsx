import PageShell from "../components/layout/PageShell";
import Hero from "../components/sections/Hero";
import TrustStats from "../components/sections/TrustStats";
import CourseSurvey from "../components/sections/CourseSurvey";
import WhyDifferent from "../components/sections/WhyDifferent";
import CourseShowcase from "../components/sections/CourseShowcase";
import AboutTeaser from "../components/sections/AboutTeaser";
import Testimonials from "../components/sections/Testimonials";
import NewsBlog from "../components/sections/NewsBlog";
import RegisterCta from "../components/sections/RegisterCta";
import Reveal from "../components/sections/Reveal";

export default function Home() {
  return (
    <PageShell>
      <Hero />
      <Reveal>
        <TrustStats />
      </Reveal>
      <Reveal>
        <CourseSurvey />
      </Reveal>
      <Reveal>
        <WhyDifferent />
      </Reveal>
      <Reveal>
        <CourseShowcase />
      </Reveal>
      <Reveal>
        <AboutTeaser />
      </Reveal>
      <Reveal>
        <Testimonials />
      </Reveal>
      <Reveal>
        <NewsBlog />
      </Reveal>
      <Reveal>
        <RegisterCta />
      </Reveal>
    </PageShell>
  );
}
