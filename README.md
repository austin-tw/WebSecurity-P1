# Setup instructions:

1. Create a package.json file: npm init -y
2. Install required packages: npm install express https fs hsts
3. Create a server.js file which contain the main codes of your server
4. Create a self-signed certificate & private key by using OpenSSL
5. Update the paths to private-key.pem and certificate.pem in your server.js file
6. Install Helmet for security headers: npm install express helmet
7. Run the node server: node server.js
8. Open your browser and go to http://localhost:3000/

# SSL configuration:

(For security reasons, certificate.pem & private-key.pem files were not uploaded to the project's github page)

1. Ensure that you have OpenSSL installed. Either download it or use a package manager like Homebrew on macOS:
   brew install openssl or use Chocolatey for Windows: choco install openssl -y

2. Run the following command to generate a private key:
   openssl genrsa -out private-key.pem 2048

3. Generate a self-signed certificate:
   openssl req -new -x509 -key private-key.pem -out certificate.pem -days 365

4. When prompted for details, fill accordingly. Make sure to set Common Name (CN) to localhost for local testing. For example:
   Country Name (2 letter code) [AU]:CA
   State or Province Name (full name) [Some-State]:Alberta
   Locality Name (eg, city) []:Calgary
   Organization Name (eg, company) [Internet Widgits Pty Ltd]:My Company
   Organizational Unit Name (eg, section) []:IT Department
   Common Name (e.g. server FQDN or YOUR name) []:localhost
   Email Address []:your-email@example.com

5. Update the paths to private-key.pem and certificate.pem in your server.js file. If located in the project root, use:
   const options = {
   key: fs.readFileSync('private-key.pem'), // Update this path
   cert: fs.readFileSync('certificate.pem'), // Update this path
   };

I chose OpenSSL instead of Let's Encrypt because it's easier to setup with just Gitbash and vscode studio.

For security headers, I use the default settings of Helmet:

X-DNS-Prefetch-Control: which disables DNS prefetching.

X-Frame-Options: which protects against clickjacking.

X-Content-Type-Options: which Prevents MIME-sniffing.

Strict-Transport-Security (HSTS): which forces HTTPS.

X-Permitted-Cross-Domain-Policies: which blocks Flash and PDF cross-domain requests.

Referrer-Policy: which sets the referrer policy to no-referrer.

# Caching strategies:

I only have caching strategies for my GET routes. My POST and PUT routes do not have cache control, because they are used to modify data, so not too much sense in caching them.

My GET routes:
app.get("/", cacheMiddleware, (req, res) => {
res.send("Hello from the Wellness App!");
});

app.get("/goals", cacheMiddleware, (req, res) => {
res.send("Showing wellness goals");
});

app.get("/goals/:id", cacheMiddleware, (req, res) => {
const goalId = req.params.id;
res.send(`Showing steps for goal No.${goalId}`);
});

As instructed by the assignment, the GET routes will Cache for 5 minutes with stale-while-revalidate option (I set it to 6min). While the GET route for user-profile has no cache to protect sensitive user data. This caching strategy will ease the load on the server by having the cache content considered fresh for 5min, where clients serve the cached response without checking with the server. Then after 5 minutes, the cached content becomes stale, for the next 6min, if a client request the content, the cache could provide the stale content, but in parallel, the cache initiates a background request to the server to fetch an updated version.

# Lessons learned:

-how to setup Express and what it actually does

-how to setup Helmet and what security benefits it provides

-how to setup Middleware and the functions it can bridge

-how caching strategies affects server performance and latency

-how to design routes to work for the web application

I think the most challenging part is to put together all the pieces of knowledge we have learned in classroom labs. This assignment really forces me to think about how to link
together everything we have learned in a realistic way. For instance, the assignment instruct us to utilize caching strategies, upon further inspection, I realized that GET route
will have a different caching strategy than POST and PUT route, because GET receives data from server while the other two modifies the data on the server. So it doesn't make too much
sense to have caching strategy for POST and PUT route. Also, the stale-while-revalidate concept is challenging for me to understand. It took me a long while to understand what it does exactly after much googling.
