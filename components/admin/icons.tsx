// Small inline icon set (16px, stroke) matching the Webflow editor's look
type P = { size?: number }
const s = (size = 16) => ({ width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const })

export const IconSearch = ({ size = 13 }: P) => <svg {...s(size)}><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>
export const IconPlus = ({ size }: P) => <svg {...s(size)}><path d="M8 3v10M3 8h10" /></svg>
export const IconDots = ({ size }: P) => <svg {...s(size)}><circle cx="3.5" cy="8" r=".6" fill="currentColor" /><circle cx="8" cy="8" r=".6" fill="currentColor" /><circle cx="12.5" cy="8" r=".6" fill="currentColor" /></svg>
export const IconChevronRight = ({ size }: P) => <svg {...s(size)}><path d="m6 3.5 4.5 4.5L6 12.5" /></svg>
export const IconChevronDown = ({ size }: P) => <svg {...s(size)}><path d="m3.5 6 4.5 4.5L12.5 6" /></svg>
export const IconArrowLeft = ({ size }: P) => <svg {...s(size)}><path d="M13 8H3M7 4 3 8l4 4" /></svg>
export const IconEye = ({ size }: P) => <svg {...s(size)}><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" /><circle cx="8" cy="8" r="2" /></svg>
export const IconFilter = ({ size }: P) => <svg {...s(size)}><path d="M2.5 3.5h11l-4.2 5v4l-2.6 1v-5z" /></svg>
export const IconExport = ({ size }: P) => <svg {...s(size)}><path d="M8 10V2.5M5 5.5l3-3 3 3M3 9.5v3.5h10V9.5" /></svg>
export const IconExternal = ({ size = 14 }: P) => <svg {...s(size)}><path d="M6 3.5H3.5v9h9V10M9 3h4v4M13 3 7.5 8.5" /></svg>
export const IconReplace = ({ size }: P) => <svg {...s(size)}><path d="M12.5 6A5 5 0 0 0 3.6 4.4M3.5 10a5 5 0 0 0 8.9 1.6M3.5 2v2.8h2.8M12.5 14v-2.8H9.7" /></svg>
export const IconTrash = ({ size }: P) => <svg {...s(size)}><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" /></svg>
export const IconLink = ({ size = 13 }: P) => <svg {...s(size)}><path d="M6.8 9.2a2.5 2.5 0 0 0 3.6 0l2-2a2.5 2.5 0 0 0-3.6-3.6l-.9.9M9.2 6.8a2.5 2.5 0 0 0-3.6 0l-2 2a2.5 2.5 0 0 0 3.6 3.6l.9-.9" /></svg>
export const IconCalendar = ({ size }: P) => <svg {...s(size)}><rect x="2.5" y="3.5" width="11" height="10" rx="1.2" /><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" /></svg>
export const IconUpload = ({ size = 18 }: P) => <svg {...s(size)}><path d="M8 11V3M5 6l3-3 3 3M3 11v2.5h10V11" /></svg>
export const IconX = ({ size = 12 }: P) => <svg {...s(size)}><path d="m4 4 8 8M12 4l-8 8" /></svg>
export const IconLogout = ({ size = 14 }: P) => <svg {...s(size)}><path d="M6.5 13.5h-3v-11h3M10 5l3 3-3 3M13 8H6" /></svg>
export const IconSortDown = ({ size = 12 }: P) => <svg {...s(size)}><path d="m4 6 4 4 4-4" /></svg>
export const IconSortUp = ({ size = 12 }: P) => <svg {...s(size)}><path d="m4 10 4-4 4 4" /></svg>
