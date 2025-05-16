import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    FaCarSide,
    FaCalendarAlt,
    FaUsers,
    FaMoneyBillWave,
    FaChartBar,
    FaArrowRight,
    FaCheck
} from 'react-icons/fa';

const ModernOnboardingPage = () => {
    const [scrollY, setScrollY] = useState(0);
    const [heroVisible, setHeroVisible] = useState(true);
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const testimonialsRef = useRef(null);
    const pricingRef = useRef(null);

    // Handle scroll for parallax and animations
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);

        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="font-sans text-gray-800 bg-gray-50">
            {/* Floating hexagons */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute opacity-10"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${40 + Math.random() * 60}px`,
                            height: `${40 + Math.random() * 60}px`,
                            background: `linear-gradient(135deg, #3498db ${Math.random() * 50}%, #2c3e50)`,
                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                            animation: `float ${5 + Math.random() * 15}s ease-in-out infinite alternate`,
                            animationDelay: `${Math.random() * 5}s`,
                            transform: `rotate(${Math.random() * 360}deg)`
                        }}
                    />
                ))}
            </div>

            {/* Hero Section */}
            <section
                ref={heroRef}
                className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
                style={{
                    backgroundPosition: `center ${scrollY * 0.5}px`
                }}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1635764738108-4bbe0e40f2f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.2,
                        filter: 'blur(2px)'
                    }}
                />

                <div
                    className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"
                    style={{
                        transform: `translateY(${scrollY * -0.2}px)`
                    }}
                />

                <div
                    className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl"
                    style={{
                        transform: `translateY(${scrollY * 0.2}px)`
                    }}
                />

                <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center">
                    <div className="lg:w-1/2" style={{ transform: `translateY(${scrollY * -0.1}px)` }}>
                        <div className="flex items-center mb-6">
                            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg">
                                <FaCarSide className="text-3xl text-white" />
                            </div>
                            <h1 className="text-3xl ml-4 font-bold">Detailing CRM</h1>
                        </div>

                        <h2 className="text-5xl font-extrabold mb-6 leading-tight">
                            Prestiżowe rozwiązanie dla <span className="text-blue-400">biznesu detailingowego</span>
                        </h2>

                        <p className="text-xl text-gray-300 mb-10 max-w-xl">
                            Transformuj swój biznes dzięki kompleksowej platformie zaprojektowanej z myślą o prestiżowych usługach detailingowych. Zoptymalizuj procesy, zwiększ zadowolenie klientów i rosnąć szybciej niż konkurencja.
                        </p>

                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link
                                to="/login"
                                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg text-white font-bold text-lg flex items-center justify-center hover:from-blue-700 hover:to-blue-900 transform hover:scale-105 transition duration-300 shadow-lg"
                            >
                                Rozpocznij pracę <FaArrowRight className="ml-2" />
                            </Link>
                            <button className="px-10 py-4 bg-transparent border border-white/30 backdrop-blur-md rounded-lg text-white font-bold text-lg hover:bg-white/10 transition duration-300">
                                Umów prezentację
                            </button>
                        </div>

                        <div className="mt-12 flex items-center">
                            <div className="flex -space-x-2">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-10 rounded-full border-2 border-blue-600"
                                        style={{
                                            backgroundImage: `url("https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i + 10}.jpg")`,
                                            backgroundSize: 'cover'
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-300">Dołącz do ponad <span className="font-bold text-white">500+</span> profesjonalnych firm</p>
                                <div className="flex items-center mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                    ))}
                                    <span className="ml-1 text-xs text-gray-300">(4.9/5)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2 mt-12 lg:mt-0">
                        <div
                            className="relative w-full aspect-video bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
                            style={{
                                transform: `translateY(${scrollY * 0.05}px)`,
                            }}
                        >
                            {/* Mock browser window */}
                            <div className="h-8 bg-gray-800 flex items-center px-4">
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="mx-auto h-5 w-96 bg-gray-700 rounded-full"></div>
                            </div>

                            {/* Dashboard preview image */}
                            <div className="h-full w-full bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center">
                                <div className="grid grid-cols-3 gap-4 w-11/12 mx-auto">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-white/10 backdrop-blur-lg p-4 rounded-lg h-32 flex flex-col justify-between">
                                            <div className="w-10 h-10 rounded-lg bg-blue-600/30 flex items-center justify-center">
                                                {i % 5 === 0 && <FaCarSide className="text-blue-400" />}
                                                {i % 5 === 1 && <FaCalendarAlt className="text-blue-400" />}
                                                {i % 5 === 2 && <FaUsers className="text-blue-400" />}
                                                {i % 5 === 3 && <FaMoneyBillWave className="text-blue-400" />}
                                                {i % 5 === 4 && <FaChartBar className="text-blue-400" />}
                                            </div>
                                            <div>
                                                <div className="h-3 w-20 bg-white/20 rounded-full"></div>
                                                <div className="h-6 w-3/4 bg-white/30 mt-2 rounded-full"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce">
                    <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* Features Section */}
            <section ref={featuresRef} className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
              FUNKCJONALNOŚCI
            </span>
                        <h2 className="text-4xl font-bold mb-4">Zaprojektowane dla sukcesu Twojego biznesu</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Detailing CRM to kompleksowe narzędzie, które pomoże Ci prowadzić i rozwijać prestiżowy biznes detailingowy.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[
                            {
                                icon: <FaCalendarAlt className="text-3xl" />,
                                title: "Inteligentny kalendarz",
                                description: "Zaawansowane zarządzanie harmonogramem z automatycznymi powiadomieniami i inteligentnym przydzielaniem zasobów."
                            },
                            {
                                icon: <FaUsers className="text-3xl" />,
                                title: "Zaawansowana baza klientów",
                                description: "Szczegółowe profile klientów z pełną historią wizyt, danymi o pojazdach i preferencjach."
                            },
                            {
                                icon: <FaMoneyBillWave className="text-3xl" />,
                                title: "Kompleksowe finanse",
                                description: "Automatyczne fakturowanie, śledzenie płatności i zaawansowane raporty finansowe w czasie rzeczywistym."
                            },
                            {
                                icon: <FaCarSide className="text-3xl" />,
                                title: "Zarządzanie flotą",
                                description: "Pełna dokumentacja techniczna pojazdów, historia serwisowa i przypomnienia o przeglądach."
                            },
                            {
                                icon: <FaChartBar className="text-3xl" />,
                                title: "Zaawansowana analityka",
                                description: "Dashboardy z kluczowymi wskaźnikami efektywności i prognozami biznesowymi."
                            },
                            {
                                icon: <i className="text-3xl">✓</i>,
                                title: "Wielopoziomowa autoryzacja",
                                description: "System uprawnień dla pracowników z różnymi poziomami dostępu i śledzeniem aktywności."
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl border border-gray-100 hover:border-blue-100"
                                style={{
                                    transform: scrollY > 300 ? 'translateY(0)' : 'translateY(50px)',
                                    opacity: scrollY > 300 ? 1 : 0,
                                    transition: `transform 0.8s ease-out ${index * 0.1}s, opacity 0.8s ease-out ${index * 0.1}s`
                                }}
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <a href="#" className="text-blue-600 font-semibold flex items-center hover:text-blue-800 transition-colors">
                                        Dowiedz się więcej <FaArrowRight className="ml-2" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section
                ref={testimonialsRef}
                className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden"
            >
                <div
                    className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white to-transparent"
                    style={{
                        transform: `translateY(${scrollY * 0.05}px)`
                    }}
                />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
            <span className="inline-block px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm font-semibold mb-4">
              OPINIE KLIENTÓW
            </span>
                        <h2 className="text-4xl font-bold mb-4">Co mówią o nas profesjonaliści</h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Detailing CRM jest wybierany przez najbardziej prestiżowe firmy detailingowe w całej Europie.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[
                            {
                                text: "Detailing CRM zrewolucjonizował sposób, w jaki zarządzamy naszą prestiżową firmą. Możliwość śledzenia każdego etapu pracy to coś, czego nie zapewniał żaden inny system.",
                                name: "Piotr Kowalski",
                                company: "Premium Auto Detailing",
                                img: "https://randomuser.me/api/portraits/men/32.jpg"
                            },
                            {
                                text: "Po wdrożeniu Detailing CRM nasza wydajność wzrosła o 40%. Dzięki automatyzacji procesów możemy skupić się na tym, co najważniejsze - doskonałej obsłudze klienta.",
                                name: "Anna Nowak",
                                company: "Elite Car Care",
                                img: "https://randomuser.me/api/portraits/women/44.jpg"
                            },
                            {
                                text: "Najlepszy system dla profesjonalnych firm detailingowych. Integracja z systemami finansowymi i moduł raportowania to funkcje, bez których nie wyobrażamy sobie pracy.",
                                name: "Tomasz Wiśniewski",
                                company: "Diamond Shine Detailing",
                                img: "https://randomuser.me/api/portraits/men/22.jpg"
                            }
                        ].map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10 transition-all duration-300 hover:bg-white/10"
                                style={{
                                    transform: scrollY > 1000 ? 'translateY(0) rotate(0deg)' : 'translateY(100px) rotate(5deg)',
                                    opacity: scrollY > 1000 ? 1 : 0,
                                    transition: `transform 0.8s ease-out ${index * 0.15}s, opacity 0.8s ease-out ${index * 0.15}s`
                                }}
                            >
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500">
                                        <img src={testimonial.img} alt={testimonial.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{testimonial.name}</h4>
                                        <p className="text-blue-300 text-sm">{testimonial.company}</p>
                                    </div>
                                </div>
                                <p className="text-gray-300 italic">"{testimonial.text}"</p>
                                <div className="mt-6 flex">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section ref={pricingRef} className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
              CENNIK
            </span>
                        <h2 className="text-4xl font-bold mb-4">Plany dostosowane do Twoich potrzeb</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Elastyczne plany cenowe dla firm każdej wielkości, od małych warsztatów po duże sieci detailingowe.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Starter",
                                price: "299",
                                description: "Idealny dla małych firm rozpoczynających działalność",
                                features: [
                                    "Kalendarz i zarządzanie wizytami",
                                    "Podstawowa baza klientów",
                                    "Wystawianie faktur",
                                    "Mobilny dostęp",
                                    "Email support"
                                ],
                                highlight: false
                            },
                            {
                                name: "Professional",
                                price: "599",
                                description: "Kompletne rozwiązanie dla rozwijających się firm",
                                features: [
                                    "Wszystko z planu Starter",
                                    "Zaawansowane raporty",
                                    "Integracja z systemami księgowymi",
                                    "Niestandardowe szablony dokumentów",
                                    "Priorytetowe wsparcie techniczne",
                                    "Szkolenie online"
                                ],
                                highlight: true
                            },
                            {
                                name: "Enterprise",
                                price: "1299",
                                description: "Dla sieci salonów i firm o złożonej strukturze",
                                features: [
                                    "Wszystko z planu Professional",
                                    "Wiele lokalizacji",
                                    "API dla integracji",
                                    "Dedykowany manager sukcesu",
                                    "Wdrożenie na miejscu",
                                    "SLA 24/7 wsparcie"
                                ],
                                highlight: false
                            }
                        ].map((plan, index) => (
                            <div
                                key={index}
                                className={`rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl border ${
                                    plan.highlight
                                        ? 'border-blue-500 shadow-xl shadow-blue-100'
                                        : 'border-gray-200 shadow-lg'
                                }`}
                                style={{
                                    transform: scrollY > 1600 ? 'translateY(0)' : 'translateY(100px)',
                                    opacity: scrollY > 1600 ? 1 : 0,
                                    transition: `transform 0.8s ease-out ${index * 0.15}s, opacity 0.8s ease-out ${index * 0.15}s`
                                }}
                            >
                                <div className={`p-8 ${plan.highlight ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white' : 'bg-white'}`}>
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        <span className="ml-1 text-lg">PLN/mies.</span>
                                    </div>
                                    <p className={`mt-4 ${plan.highlight ? 'text-blue-100' : 'text-gray-600'}`}>{plan.description}</p>
                                </div>
                                <div className="p-8 bg-white">
                                    <ul className="space-y-4">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start">
                                                <div className={`flex-shrink-0 w-5 h-5 rounded-full ${plan.highlight ? 'bg-blue-600' : 'bg-gray-200'} flex items-center justify-center mt-1`}>
                                                    <FaCheck className={`text-xs ${plan.highlight ? 'text-white' : 'text-gray-700'}`} />
                                                </div>
                                                <span className="ml-3 text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className={`mt-8 w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                                            plan.highlight
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-lg hover:shadow-blue-200'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                    >
                                        Wybierz plan
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-6">Gotowy, by usprawnić swój biznes?</h2>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
                        Dołącz do setek firm detailingowych, które już korzystają z naszego systemu. Zacznij już teraz i zobacz, jak Detailing CRM może pomóc w rozwoju Twojego biznesu.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link
                            to="/login"
                            className="px-10 py-4 bg-white text-blue-700 rounded-lg font-bold text-lg flex items-center justify-center hover:bg-gray-100 transform hover:scale-105 transition duration-300 shadow-lg"
                        >
                            Rozpocznij pracę <FaArrowRight className="ml-2" />
                        </Link>
                        <button className="px-10 py-4 bg-transparent border border-white rounded-lg text-white font-bold text-lg hover:bg-white/10 transition duration-300">
                            Skontaktuj się z nami
                        </button>
                    </div>

                    <div className="mt-20 flex justify-center space-x-8">
                        <div className="text-center">
                            <h3 className="text-4xl font-bold">500+</h3>
                            <p className="text-blue-100">zadowolonych klientów</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-4xl font-bold">98%</h3>
                            <p className="text-blue-100">satysfakcji klientów</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-4xl font-bold">24/7</h3>
                            <p className="text-blue-100">wsparcie techniczne</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-gray-900 text-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-8 md:mb-0">
                            <div className="flex items-center mb-4">
                                <FaCarSide className="text-2xl text-blue-500" />
                                <span className="text-xl font-bold ml-2">Detailing CRM</span>
                            </div>
                            <p className="text-gray-400 max-w-xs">
                                Profesjonalne rozwiązanie dla biznesu detailingowego, które pomaga Ci rosnąć i osiągać więcej.
                            </p>
                            <div className="mt-4 flex space-x-4">
                                {['facebook', 'twitter', 'instagram', 'linkedin'].map(platform => (
                                    <a
                                        key={platform}
                                        href="#"
                                        className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                                        aria-label={platform}
                                    >
                                        <i className={`fab fa-${platform}`}></i>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Produkt</h4>
                                <ul className="space-y-2">
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Funkcje</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cennik</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integracje</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Aktualizacje</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold mb-4">Firma</h4>
                                <ul className="space-y-2">
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">O nas</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Kariera</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Partnerzy</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold mb-4">Wsparcie</h4>
                                <ul className="space-y-2">
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Dokumentacja</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Centrum pomocy</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Kontakt</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status usług</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            &copy; {new Date().getFullYear()} Detailing CRM. Wszystkie prawa zastrzeżone.
                        </p>
                        <div className="mt-4 md:mt-0 flex space-x-6">
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Polityka prywatności</a>
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Warunki korzystania</a>
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Floating elements */}
            <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${heroVisible ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'}`}>
                <a
                    href="#top"
                    className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                    onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </a>
            </div>

            {/* Add keyframes for animations */}
            <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }
      `}</style>
        </div>
    );
};

// Styled Components (kontynuacja)
const LogoText = styled.h1`
  font-size: 24px;
  color: white;
  font-weight: 700;
  margin: 0;
`;

const HeroTitle = styled.h2`
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin-bottom: 24px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
  
  @media (max-width: 576px) {
    font-size: 28px;
  }
`;

const HighlightText = styled.span`
  background: linear-gradient(90deg, #3498db, #2ecc71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`;

const HeroDescription = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 36px;
  
  @media (max-width: 576px) {
    font-size: 16px;
  }
`;

const CallToActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
  
  @media (max-width: 991px) {
    justify-content: center;
  }
`;

const PrimaryButton = styled(Link)<{ light?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: ${props => props.light ? 'white' : 'linear-gradient(90deg, #3498db, #2980b9)'};
  color: ${props => props.light ? '#3498db' : 'white'};
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(41, 128, 185, 0.2);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 25px rgba(41, 128, 185, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled.button<{ light?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: transparent;
  color: ${props => props.light ? 'white' : 'rgba(255, 255, 255, 0.9)'};
  border: 1px solid ${props => props.light ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const TrustBadges = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 991px) {
    justify-content: center;
  }
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const UserImages = styled.div`
  display: flex;
  margin-right: 16px;
`;

const UserImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid white;
  margin-left: -10px;
  object-fit: cover;
  
  &:first-child {
    margin-left: 0;
  }
`;

const TrustText = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  display: flex;
  flex-direction: column;
`;

const StarRating = styled.div`
  display: flex;
  align-items: center;
  margin-top: 4px;
  color: #FFD700;
  font-size: 12px;
  
  span {
    color: rgba(255, 255, 255, 0.7);
    margin-left: 4px;
  }
`;

const DashboardPreview = styled.div`
  width: 100%;
  max-width: 500px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);
  transition: all 0.5s ease;
  
  &:hover {
    transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
  }
  
  @media (max-width: 991px) {
    transform: none;
    max-width: 90%;
  }
`;

const BrowserControls = styled.div`
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
`;

const BrowserDots = styled.div`
  display: flex;
  gap: 6px;
`;

const BrowserDot = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
`;

const BrowserAddressBar = styled.div`
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-left: 16px;
  flex: 1;
`;

const DashboardContent = styled.div`
  padding: 24px;
  height: 300px;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(44, 62, 80, 0.2) 100%);
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  
  @media (max-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const DashboardCard = styled.div`
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  height: 88px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CardIcon = styled.div`
  width: 32px;
  height: 32px;
  background: rgba(52, 152, 219, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3498db;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CardTitle = styled.div`
  height: 6px;
  width: 60%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
`;

const CardValue = styled.div`
  height: 12px;
  width: 80%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  animation: ${bounceAnimation} 2s infinite;
  cursor: pointer;
  z-index: 10;
  transform: rotate(180deg);
  
  &:hover {
    color: rgba(255, 255, 255, 0.9);
  }
`;

const FeaturesSection = styled.section`
  padding: 100px 20px;
  background: white;
`;

const SectionHeader = styled.div<{ light?: boolean }>`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 60px;
`;

const Badge = styled.span<{ dark?: boolean }>`
  display: inline-block;
  padding: 6px 12px;
  background: ${props => props.dark ? 'rgba(52, 152, 219, 0.2)' : 'rgba(52, 152, 219, 0.1)'};
  color: ${props => props.dark ? '#3498db' : '#2980b9'};
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2<{ light?: boolean }>`
  font-size: 40px;
  font-weight: 700;
  color: ${props => props.light ? 'white' : '#2c3e50'};
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 32px;
  }
  
  @media (max-width: 576px) {
    font-size: 28px;
  }
`;

const SectionDescription = styled.p<{ light?: boolean }>`
  font-size: 18px;
  line-height: 1.6;
  color: ${props => props.light ? 'rgba(255, 255, 255, 0.8)' : '#7f8c8d'};
  
  @media (max-width: 576px) {
    font-size: 16px;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-10px) !important;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  margin-bottom: 24px;
  box-shadow: 0 10px 20px rgba(41, 128, 185, 0.2);
`;

const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12px;
`;

const FeatureDescription = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #7f8c8d;
  margin-bottom: 20px;
`;

const LearnMoreLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3498db;
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
  cursor: pointer;
  
  &:hover {
    color: #2980b9;
  }
`;

const TestimonialsSection = styled.section`
  padding: 100px 20px;
  background: #2c3e50;
  position: relative;
  overflow: hidden;
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TestimonialCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px) rotate(0deg) !important;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const TestimonialHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const TestimonialAvatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 16px;
  border: 2px solid #3498db;
  object-fit: cover;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  flex-direction: column;
`;

const TestimonialName = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const TestimonialCompany = styled.span`
  font-size: 14px;
  color: #3498db;
`;

const TestimonialText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  font-style: italic;
`;

const TestimonialStars = styled.div`
  display: flex;
  gap: 4px;
  color: #FFD700;
`;

const StatsSection = styled.section`
  padding: 100px 20px;
  background: white;
`;

const StatsContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const StatsHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const StatValue = styled.div`
  font-size: 48px;
  font-weight: 800;
  color: #3498db;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #3498db, #2980b9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`;

const StatLabel = styled.div`
  font-size: 18px;
  color: #2c3e50;
  font-weight: 600;
`;

const CTASection = styled.section`
  padding: 100px 20px;
  background: linear-gradient(90deg, #3498db, #2980b9);
`;

const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const CTATitle = styled.h2`
  font-size: 40px;
  font-weight: 700;
  color: white;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const CTADescription = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  
  @media (max-width: 576px) {
    font-size: 16px;
  }
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const Footer = styled.footer`
  padding: 80px 20px 40px;
  background: #1e2a3a;
  color: white;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FooterTop = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
  margin-bottom: 60px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const FooterCompany = styled.div``;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
`;

const FooterDescription = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
`;

const FooterSocial = styled.div`
  display: flex;
  gap: 12px;
`;

const SocialLink = styled.a`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    background: #3498db;
    transform: translateY(-3px);
  }
`;

const FooterLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const FooterColumn = styled.div``;

const FooterColumnTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: white;
`;

const FooterMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterMenuItem = styled.li`
  margin-bottom: 12px;
`;

const FooterLink = styled.a`
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 14px;
  
  &:hover {
    color: #3498db;
  }
`;

const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const FooterCopyright = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
`;

const FooterLegalLinks = styled.div`
  display: flex;
  gap: 24px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
`;

const FooterLegalLink = styled.a`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.3s ease;
  
  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const ScrollToTop = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
  transition: all 0.3s ease;
  z-index: 100;
  
  &:hover {
    background: #2980b9;
    transform: translateY(-5px) scale(1.05) !important;
  }
`;

export default ModernOnboardingPage;