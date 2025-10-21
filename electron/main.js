const { app, BrowserWindow, shell, Menu } = require("electron")
const path = require("path")

const isDev = process.argv.includes("--dev")
const DEFAULT_URL = isDev ? "http://localhost:9000" : "http://long.dino.taxi"

let mainWindow

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 800,
		minHeight: 600,
		show: false,
		titleBarStyle: process.platform === "darwin" ? "default" : "default",
		icon: path.join(__dirname, 'icons', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
			webSecurity: true,
			spellcheck: true,
		},
	})

	mainWindow.loadURL(DEFAULT_URL)

	mainWindow.once("ready-to-show", () => {
		mainWindow.show()

		if (isDev) {
			mainWindow.webContents.openDevTools()
		}
	})

	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		shell.openExternal(url)
		return { action: "deny" }
	})

	mainWindow.on("closed", () => {
		mainWindow = null
	})

	// Enable context menu (right-click menu)
	mainWindow.webContents.on("context-menu", (event, params) => {
		const menuItems = []

		// Add spelling suggestions if misspelled word
		if (params.misspelledWord) {
			const suggestions = params.dictionarySuggestions.slice(0, 5)
			suggestions.forEach((suggestion) => {
				menuItems.push({
					label: suggestion,
					click() {
						mainWindow.webContents.replaceMisspelling(suggestion)
					},
				})
			})

			if (suggestions.length > 0) {
				menuItems.push({ type: "separator" })
			}

			menuItems.push({
				label: "Add to Dictionary",
				click() {
					mainWindow.webContents.session.addWordToSpellCheckerDictionary(
						params.misspelledWord
					)
				},
			})
		}

		// Add "Inspect Element" in dev mode or always show it
		if (params.isEditable) {
			menuItems.push(
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				{ type: "separator" },
				{ role: "selectAll" }
			)
		} else if (params.selectionText) {
			menuItems.push({ role: "copy" })
		}

		// Add link-related options
		if (params.linkURL) {
			if (menuItems.length > 0) {
				menuItems.push({ type: "separator" })
			}

			menuItems.push({
				label: "Copy Link",
				click() {
					const { clipboard } = require("electron")
					clipboard.writeText(params.linkURL)
				},
			})
			menuItems.push({
				label: "Open Link in Browser",
				click() {
					shell.openExternal(params.linkURL)
				},
			})
		}

		// Add image-related options
		if (params.mediaType === "image") {
			if (menuItems.length > 0) {
				menuItems.push({ type: "separator" })
			}

			menuItems.push({
				label: "Copy Image",
				click() {
					mainWindow.webContents.copyImageAt(params.x, params.y)
				},
			})
			menuItems.push({
				label: "Save Image",
				click() {
					mainWindow.webContents.downloadURL(params.srcURL)
				},
			})
		}

		// Add navigation options
		if (mainWindow.webContents.canGoBack() || mainWindow.webContents.canGoForward()) {
			if (menuItems.length > 0) {
				menuItems.push({ type: "separator" })
			}

			if (mainWindow.webContents.canGoBack()) {
				menuItems.push({ role: "back" })
			}

			if (mainWindow.webContents.canGoForward()) {
				menuItems.push({ role: "forward" })
			}

			menuItems.push({ role: "reload" })
		}

		// Always add inspect element
		if (menuItems.length > 0) {
			menuItems.push({ type: "separator" })
		}

		menuItems.push({
			label: "Inspect Element",
			click() {
				mainWindow.webContents.inspectElement(params.x, params.y)
			},
		})

		if (menuItems.length > 0) {
			const contextMenu = Menu.buildFromTemplate(menuItems)
			contextMenu.popup()
		}
	})

	if (isDev) {
		mainWindow.webContents.on(
			"did-fail-load",
			(event, errorCode, errorDescription, validatedURL) => {
				console.log(`Failed to load ${validatedURL}: ${errorDescription}`)
				console.log("Make sure The Lounge server is running on http://localhost:9000")
			}
		)
	}
}

function createMenu() {
	const template = [
		{
			label: "Edit",
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				{ role: "selectall" },
			],
		},
		{
			label: "View",
			submenu: [
				{ role: "reload" },
				{ role: "forcereload" },
				{ role: "toggledevtools" },
				{ type: "separator" },
				{ role: "resetzoom" },
				{ role: "zoomin" },
				{ role: "zoomout" },
				{ type: "separator" },
				{ role: "togglefullscreen" },
			],
		},
		{
			label: "Window",
			submenu: [{ role: "minimize" }, { role: "close" }],
		},
	]

	if (process.platform === "darwin") {
		template.unshift({
			label: app.getName(),
			submenu: [
				{ role: "about" },
				{ type: "separator" },
				{ role: "services" },
				{ type: "separator" },
				{ role: "hide" },
				{ role: "hideothers" },
				{ role: "unhide" },
				{ type: "separator" },
				{ role: "quit" },
			],
		})

		template[3].submenu = [
			{ role: "close" },
			{ role: "minimize" },
			{ role: "zoom" },
			{ type: "separator" },
			{ role: "front" },
		]
	}

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
	createWindow()
	createMenu()

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit()
	}
})
