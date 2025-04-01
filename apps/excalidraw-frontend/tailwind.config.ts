import config from "@repo/tailwind-config/tailwindConfig";

export default {
    ...config,
    content: ["./app/**/*.{tsx}", "../../packages/ui/**/*.{tsx}"]
}