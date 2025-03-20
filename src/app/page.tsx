import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              SaaS Platform
            </span>
          </div>
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-indigo-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="md:flex md:items-center md:space-x-12">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                  Your Amazing Product
                </h1>
                <p className="text-xl text-indigo-100 mb-6">
                  A powerful solution for your business needs. Streamline your
                  workflow and boost productivity.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                >
                  Get Started
                </Link>
              </div>
              <div className="md:w-1/2">
                <div className="aspect-w-16 aspect-h-9 bg-indigo-800 rounded-lg shadow-xl overflow-hidden">
                  <div className="p-8 flex items-center justify-center text-white text-xl">
                    Product Demo Image
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-12">
                Key Features
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white font-bold">{i}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Feature {i}
                  </h3>
                  <p className="text-gray-600">
                    A detailed description of feature {i} and how it helps solve
                    your problems.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-12">
                Simple Pricing
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {["Basic", "Pro", "Enterprise"].map((plan, i) => (
                <div
                  key={plan}
                  className={`bg-white p-8 rounded-lg shadow ${
                    i === 1 ? "border-2 border-indigo-500 relative" : ""
                  }`}
                >
                  {i === 1 && (
                    <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Popular
                    </span>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {plan}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${(i + 1) * 19}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[1, 2, 3, 4, 5].slice(0, i + 3).map((feature) => (
                      <li key={feature} className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span className="text-gray-600">Feature {feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/dashboard"
                    className={`w-full block text-center px-6 py-3 rounded-md font-medium ${
                      i === 1
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold mb-4">SaaS Platform</h3>
              <p className="text-gray-400">Building the future of business.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                "About",
                "Features",
                "Pricing",
                "Contact",
                "Blog",
                "Support",
              ].map((item) => (
                <div key={item} className="mb-4">
                  <Link href="#" className="text-gray-300 hover:text-white">
                    {item}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center md:text-left md:flex md:justify-between">
            <p className="text-gray-400">
              © 2024 SaaS Platform. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <div className="flex space-x-4 justify-center md:justify-end">
                {["Twitter", "Facebook", "Instagram"].map((social) => (
                  <Link
                    key={social}
                    href="#"
                    className="text-gray-400 hover:text-white"
                  >
                    {social}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
