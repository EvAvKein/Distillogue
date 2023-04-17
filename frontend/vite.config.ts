import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	server: {
		port: 3000,
		watch: {
			usePolling: true,
			/* ^ fixes dockerized file-watching on windows, can be safely disabled on linux for reduced CPU usage. info: https://vitejs.dev/config/server-options.html#server-watch, https://github.com/microsoft/WSL/issues/4739 */
		},
	},
	define: {
		"process.env": {},
	},
});
