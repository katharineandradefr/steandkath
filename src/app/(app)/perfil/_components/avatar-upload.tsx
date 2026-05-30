"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera, User } from "lucide-react";

type AvatarUploadProps = {
  value: string | null;
  onChange: (base64: string | null) => void;
};

const MAX_DIMENSION = 200;

/**
 * Redimensiona uma imagem para no máximo 200x200 e retorna base64.
 */
async function resizeImageToBase64(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Não foi possível ler a imagem."));
    };
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível processar a imagem."));
    img.src = dataUrl;
  });

  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(image.width, image.height),
  );
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Não foi possível processar a imagem.");
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL(file.type || "image/jpeg", 0.85);
}

/**
 * Avatar circular com botão de upload de foto.
 */
export function AvatarUpload({ value, onChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const base64 = await resizeImageToBase64(file);
      onChange(base64);
    } catch {
      window.alert("Não foi possível carregar a foto. Tente outra imagem.");
    }
  };

  return (
    <div className="relative mx-auto h-28 w-28">
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gray-300">
        {value ? (
          <Image
            src={value}
            alt="Foto de perfil"
            width={112}
            height={112}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-14 w-14 text-gray-500" aria-hidden />
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Alterar foto de perfil"
        className="absolute right-0 bottom-0 flex h-9 w-9 items-center justify-center rounded-full bg-gray-500 text-white shadow-md transition-colors hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
      >
        <Camera className="h-4 w-4" aria-hidden />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
