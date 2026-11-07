/**
 * Cloudinary unsigned upload servisi (Flutter CloudinaryService karşılığı).
 */
class CloudinaryService {
  private _cloudName = "";
  private _uploadPreset = "";

  get cloudName() {
    return this._cloudName;
  }
  get uploadPreset() {
    return this._uploadPreset;
  }
  get isConfigured() {
    return this._cloudName.length > 0 && this._uploadPreset.length > 0;
  }

  configure({ cloudName, uploadPreset }: { cloudName: string; uploadPreset: string }) {
    this._cloudName = cloudName;
    this._uploadPreset = uploadPreset;
  }

  /** Görseli Cloudinary'ye yükler ve secure_url döner. Hata durumunda Error fırlatır. */
  async uploadImage(file: File | Blob, fileName: string): Promise<string> {
    if (!this.isConfigured) {
      throw new Error(
        "Cloudinary is not configured. Please set Cloud Name and Upload Preset in settings.",
      );
    }

    const url = `https://api.cloudinary.com/v1_1/${this._cloudName}/image/upload`;
    const form = new FormData();
    form.append("upload_preset", this._uploadPreset);
    form.append("folder", "olimpik-kurban");
    form.append("file", file, fileName);

    const response = await fetch(url, { method: "POST", body: form });
    const text = await response.text();

    if (response.status === 200) {
      const body = JSON.parse(text);
      const secureUrl = body?.secure_url as string | undefined;
      if (secureUrl) return secureUrl;
      throw new Error(`Response does not contain secure_url. Body: ${text}`);
    }

    let errMsg = text;
    try {
      const errBody = JSON.parse(text);
      if (errBody?.error?.message) errMsg = errBody.error.message;
    } catch {
      /* ignore */
    }
    throw new Error(`Cloudinary error (${response.status}): ${errMsg}`);
  }
}

export const cloudinaryService = new CloudinaryService();

export interface SelectedFile {
  file: File;
  name: string;
}

/** Tarayıcı dosya seçicisini açarak bir görsel seçtirir. */
export function pickImage(): Promise<SelectedFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      resolve(file ? { file, name: file.name } : null);
    });
    input.click();
  });
}

