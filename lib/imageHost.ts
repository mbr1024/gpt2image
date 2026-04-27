export interface UploadResult {
  url: string;
  filename: string;
}

interface ImageHostResponse {
  result: string;
  code: number;
  url: string;
  srcName: string;
  thumb: string;
  del: string;
}

const IMAGE_HOST_URL = process.env.IMAGE_HOST_URL ?? '';
const IMAGE_HOST_TOKEN = process.env.IMAGE_HOST_TOKEN ?? '';

export function isImageHostConfigured(): boolean {
  return IMAGE_HOST_URL.length > 0 && IMAGE_HOST_TOKEN.length > 0;
}

/**
 * 上传图片到图床
 * source: base64 data URI 或远程 URL
 */
export async function uploadImage(source: string): Promise<UploadResult> {
  if (!isImageHostConfigured()) {
    throw new Error('图床未配置');
  }

  let blob: Blob;
  let filename: string;

  if (source.startsWith('data:')) {
    // base64 data URI → Blob
    const [header, data] = source.split(',');
    const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
    const ext = mime.split('/')[1] ?? 'png';
    const binary = Buffer.from(data, 'base64');
    blob = new Blob([binary], { type: mime });
    filename = `upload_${Date.now()}.${ext}`;
  } else {
    // 远程 URL → 先下载再上传
    const res = await fetch(source);
    if (!res.ok) throw new Error(`下载图片失败: ${res.status}`);
    const contentType = res.headers.get('content-type') ?? 'image/png';
    const ext = contentType.split('/')[1]?.split(';')[0] ?? 'png';
    blob = await res.blob();
    filename = `upload_${Date.now()}.${ext}`;
  }

  const formData = new FormData();
  formData.append('image', blob, filename);
  formData.append('token', IMAGE_HOST_TOKEN);

  const res = await fetch(`${IMAGE_HOST_URL}/api/index.php`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`图床上传失败: HTTP ${res.status}`);
  }

  const data: ImageHostResponse = await res.json();

  if (data.code !== 200 || data.result !== 'success') {
    throw new Error(`图床上传失败: ${data.result}`);
  }

  return { url: data.url, filename: data.srcName || filename };
}
