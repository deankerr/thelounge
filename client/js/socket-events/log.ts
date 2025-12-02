import socket from "../socket";

socket.on("log:auth", (data) => {
	if (!data || !data.token) {
		return;
	}

	const url = `logs/download/${encodeURIComponent(data.token)}`;

	const link = document.createElement("a");
	link.href = url;
	link.download = "";
	link.style.display = "none";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
});
