import css from "./FalconMountains.module.css";

/** A quiet alpine scene, with a snow leopard following the foreground ridge. */
export function FalconMountains() {
  return (
    <svg viewBox="0 0 600 280" className={css.scene} role="img" aria-label="Снежные горы и гуляющий по склону илбирс">
      <circle cx="466" cy="48" r="25" fill="#e2ecf9" />
      <path d="M0 177 61 108 91 129 158 40 210 107 252 76 314 143 383 57 431 111 480 83 550 153 600 124V280H0Z" fill="#d2e2f3" />
      <path d="m91 129 67-89 52 67-31-17-20-27-20 40-15-5Z M346 105l37-48 48 54-31-15-16-20-18 32Z M449 111l31-28 39 39-29-13-9-12-12 18Z" fill="#fff" />
      <path d="M0 215 66 167 104 180 222 66 304 168 365 123 418 177 504 119 600 210V280H0Z" fill="#96b5d6" />
      <path d="m222 66 82 102-48-32-18-35-16-12-25 43-25 7-33 8Z" fill="#f4f8fd" />
      <path d="m222 89 16 12 18 35 48 32-32-5-26-39Z" fill="#c6d9ec" />
      <path d="m365 123 53 54-28-12-23-24-14 19-21-1Z M469 144l35-25 43 42-27-9-17-17-14 16Z" fill="#eef5fc" />
      <path d="M0 244 71 207 128 223 213 166 270 196 331 176 398 218 475 182 540 217 600 199V280H0Z" fill="#6389b4" />
      <path d="m128 223 85-57 57 30-49-15-23 15-22 4Z M423 206l52-24 65 35-60-20-24 12Z" fill="#bdd3e9" />
      <path d="M0 245Q80 239 140 226T280 227T420 227T600 245V280H0Z" fill="#365f90" />
      <path d="M0 245Q80 239 140 226T280 227T420 227T600 245" fill="none" stroke="#e6f0fa" strokeWidth="3" />
      <g className={css.traveler}>
        <g className={css.facing}>
          <ellipse cx="0" cy="0" rx="40" ry="3" fill="#23466d" opacity=".18" />
          <g className={css.body}>
            <g fill="#a9bed2" stroke="#456383" strokeWidth="1.3" strokeLinejoin="round">
              <path className={css.farLeg} d="M-21-23-25-12-15-2h9l-1-3-7-1-3-8 7-10Z" />
              <path className={css.farFrontLeg} d="M17-25 16-13 23-2h9l-1-3-6-1-2-18Z" />
            </g>
            <path className={css.tail} d="M-27-28C-46-22-49-41-62-36s-8 18 1 15" fill="none" stroke="#e5edf3" strokeWidth="9" strokeLinecap="round" />
            <path d="M-29-30Q-20-38-6-33L16-32Q24-38 32-34L38-24 29-17 17-19Q0-16-18-22L-29-21Z" fill="#eaf0f4" stroke="#456383" strokeWidth="1.2" />
            <g fill="#eaf0f4" stroke="#456383" strokeWidth="1.3" strokeLinejoin="round">
              <path className={css.nearLeg} d="M-23-25Q-31-15-25-10L-23-2h11l-1-3-6-1 1-9 8-9" />
              <path className={css.nearFrontLeg} d="M13-24 15-14 12-2h12l-1-3-5-1 7-18" />
            </g>
            <path d="m26-34 1-9q6-2 8 6l6 4 3 7-4 5-12-1-5-6Z" fill="#f4f6f7" stroke="#456383" strokeWidth="1.2" />
            <path d="m28-38 1-3 3 4" fill="#8fa7bf" />
            <path d="m40-28 5 1-3 3Z" fill="#284564" />
            <circle cx="36" cy="-31" r="1.4" fill="#203d5b" />
            <path d="m33-23 6 1" fill="none" stroke="#617b97" strokeWidth=".9" />
            <g fill="none" stroke="#617b97" strokeWidth="1.8">
              <ellipse cx="-21" cy="-29" rx="3" ry="2.2" />
              <ellipse cx="-9" cy="-27" rx="2.8" ry="2" />
              <ellipse cx="3" cy="-28" rx="3" ry="2.2" />
              <ellipse cx="15" cy="-28" rx="2.5" ry="2" />
              <path d="m-17-22 3 1m13-1 3 1m26-10 2 1m-59 4-2 4m-8-7-3 3m-9-3-2-3" />
            </g>
          </g>
        </g>
      </g>
      <path d="M0 272Q100 251 198 267T390 261T600 273V280H0Z" fill="#294e7c" />
      <g fill="none" stroke="#9ebbd9" strokeWidth="1" opacity=".5">
        <path d="m52 258 15-3 11 1m243-7 17-2 10 2m143 10 18-1" />
      </g>
    </svg>
  );
}
