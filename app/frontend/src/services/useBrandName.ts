import { siteName } from "../data/siteConfig";
import useCenterSettings from "./useCenterSettings";

// Tên trung tâm lấy từ Cài đặt (Admin), không viết cứng tên thương hiệu trong từng trang
export default function useBrandName() {
  const { center } = useCenterSettings();
  return center?.name ?? siteName;
}
