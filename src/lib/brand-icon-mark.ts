/** Viewfinder mark from `public/logo/auto-verifi-mark.svg` (blue on transparent). */
export const AUTO_VERIFI_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="168 244 82 82"><g fill="#0073e3"><path d="M211.953,267.828c-11.139,0-20.177,9.028-20.177,20.166s9.039,20.177,20.177,20.177 s20.166-9.039,20.166-20.177S223.092,267.828,211.953,267.828z M211.953,300.263c-6.778,0-12.268-5.49-12.268-12.268 c0-6.778,5.49-12.268,12.268-12.268c6.778,0,12.268,5.49,12.268,12.268C224.221,294.773,218.731,300.263,211.953,300.263z"/><path d="M180.285,297.495h-10.193v32.361h32.361v-10.193h-22.168V297.495z M170.092,246.144v32.361 h10.193v-22.168h22.168v-10.193H170.092z M243.61,319.663h-22.168v10.193h32.361v-32.361H243.61V319.663z M221.442,246.144 v10.193h22.168v22.168h10.193v-32.361H221.442z"/></g></svg>`;

export function autoVerifiMarkDataUrl(): string {
  return `data:image/svg+xml,${encodeURIComponent(AUTO_VERIFI_MARK_SVG)}`;
}
