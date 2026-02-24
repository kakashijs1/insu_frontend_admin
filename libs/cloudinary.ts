import { v2 as cloudinary } from "cloudinary";
import "@/config/env";

cloudinary.config({ secure: true });

export { cloudinary };
