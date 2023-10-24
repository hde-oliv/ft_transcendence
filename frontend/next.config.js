/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true, //TODO change to false, this triggers 2 renders in development
	output: "standalone",
};

module.exports = nextConfig;
