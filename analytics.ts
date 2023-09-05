// Add this in your layout.tsx:
// <ArroyoPageview endpoint="https://8f29-136-25-102-57.ngrok-free.app" />

// src/app/analytics.tsx
export function ArroyoPageview({
  endpoint,
}: {
  endpoint: string,
}): JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }

      let event = {
        path: pathname,
        url: url,
        host: window.location.host,
        browser: window.navigator.userAgent,
        screen_height: window.screen.height,
        screen_width: window.screen.width,
        referer: document.referrer,
        title: document.title,
        browserLanguage: window.navigator.language,
        browserVersion: window.navigator.appVersion,
        time: Date.now(),
      };

      // asynchronously send the event to the server
      fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(event),
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }, [pathname, searchParams]);

  return <></>;
}
