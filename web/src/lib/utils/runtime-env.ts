const readNodeEnvDevFlag = (): boolean | undefined => {
	if (typeof process === 'undefined') return undefined;
	if (typeof process.env.NODE_ENV !== 'string' || process.env.NODE_ENV.length === 0) {
		return undefined;
	}
	return process.env.NODE_ENV !== 'production';
};

export const runtimeDev: boolean = import.meta.env?.DEV ?? readNodeEnvDevFlag() ?? false;
