// Root app: routing + tweaks.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentHue": 48,
  "density": "comfortable",
  "headingStyle": "sans"
}/*EDITMODE-END*/;

function App() {
  const [route, setRoute] = React.useState({ name: 'home' });
  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];

  // Apply tweaks live to CSS variables
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', `oklch(0.68 0.19 ${tweaks.accentHue})`);
    root.style.setProperty('--accent-ink', `oklch(0.42 0.17 ${tweaks.accentHue - 6})`);
    root.style.setProperty('--accent-soft', `oklch(0.94 0.05 ${tweaks.accentHue + 12})`);
    root.style.setProperty('--accent-soft-2', `oklch(0.97 0.025 ${tweaks.accentHue + 17})`);
  }, [tweaks.accentHue]);

  const navigate = (target) => {
    let next;
    if (typeof target === 'string') {
      if (target.includes('#')) {
        const [name, hash] = target.split('#');
        next = { name: name || 'home', hash };
      } else {
        next = { name: target };
      }
    } else next = target;
    setRoute(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (next.hash) {
      setTimeout(() => {
        const el = document.getElementById(next.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  };

  const hideFloating = route.name === 'submit';

  let Page;
  if (route.name === 'home') Page = <window.Landing navigate={navigate} tweaks={tweaks} />;
  else if (route.name === 'browse') Page = <window.Browse navigate={navigate} initialQuery={route.query} />;
  else if (route.name === 'detail') Page = <window.Detail navigate={navigate} id={route.id} />;
  else if (route.name === 'submit') Page = <window.Submit navigate={navigate} />;
  else Page = <window.Landing navigate={navigate} tweaks={tweaks} />;

  return (
    <>
      <window.Nav route={route} navigate={navigate} />
      <main>{Page}</main>
      <window.Footer navigate={navigate} />
      <window.FloatingCTA navigate={navigate} hideOn={hideFloating} />
      {window.TweaksPanel && (
        <window.TweaksPanel>
          <window.TweakSection title="Accent">
            <window.TweakSlider label="Hue" value={tweaks.accentHue} min={20} max={80} step={1}
              onChange={(v) => setTweak('accentHue', v)} />
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '6px 0 0' }}>
              ~48 = construction-cone, ~25 = red, ~70 = amber.
            </p>
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
