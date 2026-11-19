import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { getPageMeta } from "./lib/page-meta";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import BlogPost from "./pages/BlogPost";

const ProjectPage = lazy(() => import("./pages/ProjectPage"));
const TestimonialPage = lazy(() => import("./pages/TestimonialPage"));
const AskAI = lazy(() => import("./pages/AskAI"));


// מחוון טעינה לדפים שנטענים באופן עצל
function LazyFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

/**
 * כותרת הלשונית לפי העמוד. ב-HTML הראשוני השרת כבר שם לכל עמוד את הכותרת שלו, אבל ניווט בתוך האתר
 * לא טוען את העמוד מחדש, ובלי זה הלשונית וההיסטוריה היו נשארות עם הכותרת של העמוד הראשון שנפתח.
 * רק הכותרת מתעדכנת כאן: שאר התגיות (תיאור, og, canonical) נקראות רק מה-HTML הראשוני, וגוגל מבקש
 * ש-JavaScript לא ישנה את הקישור הקנוני. מקור: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
 */
function usePageTitle() {
  const [location] = useLocation();
  useEffect(() => {
    document.title = getPageMeta(location).title;
  }, [location]);
}

function Router() {
  usePageTitle();
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/project/:slug/ask-ai"}>
        <Suspense fallback={<LazyFallback />}>
          <AskAI />
        </Suspense>
      </Route>
      <Route path={"/project/:slug"}>
        <Suspense fallback={<LazyFallback />}>
          <ProjectPage />
        </Suspense>
      </Route>
      <Route path={"/testimonial/:slug"}>
        <Suspense fallback={<LazyFallback />}>
          <TestimonialPage />
        </Suspense>
      </Route>
      <Route path={"/blog/:slug"} component={BlogPost} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
