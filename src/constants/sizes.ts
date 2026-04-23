export const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1', desc: '正方形' },
  { value: '16:9', label: '16:9', desc: '宽屏横' },
  { value: '9:16', label: '9:16', desc: '宽屏竖' },
  { value: '4:3', label: '4:3', desc: '标屏横' },
  { value: '3:4', label: '3:4', desc: '标屏竖' },
  { value: '3:2', label: '3:2', desc: '经典横' },
  { value: '2:3', label: '2:3', desc: '经典竖' },
  { value: '5:4', label: '5:4', desc: '近方横' },
  { value: '4:5', label: '4:5', desc: '近方竖' },
  { value: '2:1', label: '2:1', desc: '宽横' },
  { value: '1:2', label: '1:2', desc: '长竖' },
  { value: '21:9', label: '21:9', desc: '超宽横' },
  { value: '9:21', label: '9:21', desc: '超长竖' },
] as const;

export type AspectRatio = (typeof ASPECT_RATIOS)[number]['value'];
