export async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/dq24aou28/auto/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ReactChat");

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  return await res.json(); // Contains url, public_id, etc.
}