import {defineStore} from "pinia";

interface notification {
	id: symbol;
	text: string;
	desirability: boolean | null;
	manualDismiss?: true;
}

export const useNotifications = defineStore("notifications", {
	state: () => {
		return {list: [] as notification[]};
	},

	actions: {
		create(
			text: notification["text"],
			desirability: notification["desirability"],
			manualDismiss?: notification["manualDismiss"]
		) {
			const id = Symbol();
			const notif: notification = {
				id,
				text,
				desirability,
				manualDismiss,
			};
			this.list.push(notif);
			if (!manualDismiss) {
				setTimeout(() => this.delete(id), text.length * 150 + 3000);
			}
		},
		delete(notifId: symbol) {
			this.list = this.list.filter((notif) => notif.id !== notifId);
		},
	},
});
