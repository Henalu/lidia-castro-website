import { LandingSections } from "../components/home/LandingSections";
import { useSiteContentData } from "../lib/hooks";

export function HomePage() {
  const { content } = useSiteContentData();

  return <LandingSections content={content} />;
}
