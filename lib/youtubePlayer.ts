export type YoutubePlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getDuration(): number;
  getCurrentTime(): number;
  destroy(): void;
};
type YoutubeAPI = { Player: new (element: HTMLElement, options: {
  videoId: string;
  host: string;
  width: number; height: number;
  playerVars: Record<string, string | number>;
  events: {
    onReady: (event: { target: YoutubePlayer }) => void;
    onStateChange: (event: { data: number }) => void;
    onError: () => void;
    onAutoplayBlocked: () => void;
  };
}) => YoutubePlayer };
type YoutubeWindow = Window & { YT?: YoutubeAPI; onYouTubeIframeAPIReady?: () => void };
let pending: Promise<YoutubeAPI> | null = null;

export function loadYoutubePlayer(): Promise<YoutubeAPI> {
  const host = window as YoutubeWindow;
  if (host.YT?.Player) return Promise.resolve(host.YT);
  if (pending) return pending;
  pending = new Promise<YoutubeAPI>((resolve, reject) => {
    const previous = host.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(() => reject(new Error("youtube-timeout")), 15_000);
    host.onYouTubeIframeAPIReady = () => {
      clearTimeout(timeout);
      previous?.();
      if (host.YT?.Player) resolve(host.YT);
      else reject(new Error("youtube-unavailable"));
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error("youtube-unavailable")); };
      document.head.appendChild(script);
    }
  }).catch(error => { pending = null; throw error; });
  return pending;
}
