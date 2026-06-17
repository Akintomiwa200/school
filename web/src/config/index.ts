export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "School LMS",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  apiUrl: "/api/v1",
  jitsiDomain: process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? "meet.jit.si",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
};

export { cloudinaryConfig } from "./cloudinary";
