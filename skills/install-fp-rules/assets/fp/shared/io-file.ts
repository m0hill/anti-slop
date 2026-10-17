const IO_FILE = /\.io\.[cm]?[jt]sx?$/u;

/**
 * Reports whether a file is an IO file, such as `clock.io.ts`. IO files hold the program's side
 * effects and wrap foreign APIs that throw, return `null`, or need classes, so the rules skip them.
 */
export function isIoFile(filename: string): boolean {
	return IO_FILE.test(filename.replaceAll("\\", "/"));
}
