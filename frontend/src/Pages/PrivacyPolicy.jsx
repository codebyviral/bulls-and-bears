import React from "react";
import {
  Shield,
  Lock,
  Mail,
  Database,
  Globe,
  Phone,
  MapPin,
  ExternalLink,
  Server,
  AlertTriangle,
} from "lucide-react";

const PrivacyPolicy = () => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-12">
          {/* Header */}
          <div className="text-center mb-12 border-b border-gray-300 pb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-blue-100">
                <Shield className="w-12 h-12 text-blue-700" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 text-gray-900 tracking-wide">
              PRIVACY POLICY
            </h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Bulls & Bears Finance Club
            </h2>
            <h3 className="text-xl text-gray-700 mb-4">
              Trading Simulation Platform
            </h3>
            <p className="text-lg text-gray-600 mb-2">
              Pandit Deendayal Energy University (PDEU), Gandhinagar, Gujarat, India
            </p>
            <p className="text-base text-gray-600 font-medium">
              Effective Date: {currentDate}
            </p>
          </div>

          {/* Introduction */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-blue-600 pb-2">
              1. INTRODUCTION AND SCOPE
            </h2>
            <p className="mb-6 leading-relaxed text-gray-800 text-lg">
              This Privacy Policy ("Policy") governs the collection, processing, storage, and disclosure of personal information by the Bulls & Bears Trading Simulation Platform ("Platform", "Service", "Application"), operated by the Bulls & Bears Finance Club ("Club", "We", "Us", "Our") of Pandit Deendayal Energy University (PDEU), Gandhinagar, Gujarat, India.
            </p>
            <div className="p-6 rounded-lg border-2 border-green-600 bg-green-50">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-green-700 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-lg text-green-800 mb-2">
                    IMPORTANT NOTICE: EDUCATIONAL SIMULATION ONLY
                  </p>
                  <p className="text-green-800 leading-relaxed">
                    This Platform is strictly an educational trading simulation using virtual currency only. No real money, investments, securities, or actual financial transactions of any kind are conducted, facilitated, or processed through this Platform.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Collection */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-blue-600 pb-2">
              2. INFORMATION COLLECTION PRACTICES
            </h2>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              2.1 Personal Information Provided by Users
            </h3>
            <div className="mb-6 p-4 bg-gray-50 rounded border-l-4 border-gray-400">
              <ul className="space-y-2 text-gray-800 text-lg">
                <li><strong>Registration Information:</strong> Full name, email address, student identification details</li>
                <li><strong>Profile Data:</strong> User preferences, avatar/profile pictures, biographical information</li>
                <li><strong>Trading Simulation Data:</strong> Virtual portfolio information, trading history, simulation performance metrics</li>
                <li><strong>Communication Records:</strong> Support requests, feedback submissions, survey responses</li>
                <li><strong>Educational Content:</strong> Quiz responses, learning progress, course completion data</li>
              </ul>
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              2.2 Google OAuth 2.0 Integration for Email Services
            </h3>
            <div className="p-6 rounded-lg border-2 border-blue-300 bg-blue-50 mb-6">
              <div className="flex items-start">
                <Mail className="w-8 h-8 text-blue-700 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-xl font-bold text-blue-800 mb-3">Server-Side Email Integration</h4>
                  <p className="text-blue-800 mb-4 leading-relaxed">
                    We utilize Google OAuth 2.0 exclusively for server-side email functionality through Nodemailer, NOT for user authentication. This integration enables our Platform to send automated emails including:
                  </p>
                  <ul className="text-blue-800 space-y-1 mb-4">
                    <li>• Account registration confirmations</li>
                    <li>• Password reset notifications</li>
                    <li>• Trading simulation updates and reports</li>
                    <li>• Educational content notifications</li>
                    <li>• Platform maintenance and security alerts</li>
                    <li>• Club announcements and event notifications</li>
                  </ul>
                  <div className="p-4 bg-blue-100 rounded border border-blue-300">
                    <p className="text-sm text-blue-900 font-medium">
                      <strong>Technical Implementation:</strong> Google OAuth credentials are stored securely on our servers and used exclusively for automated email delivery. No user Google account access or personal Google data is requested or obtained.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              2.3 Automatically Collected Technical Information
            </h3>
            <div className="mb-6 p-4 bg-gray-50 rounded border-l-4 border-gray-400">
              <ul className="space-y-2 text-gray-800 text-lg">
                <li><strong>Network Information:</strong> IP address, geographical location (city/state level), internet service provider</li>
                <li><strong>Device Information:</strong> Browser type and version, operating system, device type, screen resolution</li>
                <li><strong>Usage Analytics:</strong> Pages visited, features utilized, session duration, click patterns</li>
                <li><strong>Performance Data:</strong> Page load times, error logs, system performance metrics</li>
                <li><strong>Security Logs:</strong> Login attempts, suspicious activities, access patterns</li>
              </ul>
            </div>
          </div>

          {/* Information Usage */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-blue-600 pb-2">
              3. INFORMATION USAGE AND PROCESSING
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div className="p-6 rounded-lg bg-blue-50 border border-blue-200">
                <h3 className="text-xl font-bold mb-4 text-blue-900">
                  3.1 Primary Educational Purposes
                </h3>
                <ul className="space-y-2 text-blue-800">
                  <li>• Deliver comprehensive trading simulation experience</li>
                  <li>• Track and analyze learning progress and outcomes</li>
                  <li>• Generate personalized educational analytics and reports</li>
                  <li>• Facilitate Bulls & Bears Finance Club activities and events</li>
                  <li>• Provide customized learning recommendations</li>
                  <li>• Enable peer-to-peer learning and competition features</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-green-50 border border-green-200">
                <h3 className="text-xl font-bold mb-4 text-green-900">
                  3.2 Platform Operations and Security
                </h3>
                <ul className="space-y-2 text-green-800">
                  <li>• Maintain secure user accounts and access controls</li>
                  <li>• Perform system maintenance and security monitoring</li>
                  <li>• Provide technical support and user assistance</li>
                  <li>• Ensure compliance with university policies and regulations</li>
                  <li>• Prevent fraud, abuse, and unauthorized access</li>
                  <li>• Optimize Platform performance and user experience</li>
                </ul>
              </div>
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              3.3 Email Communication Services
            </h3>
            <div className="p-6 rounded-lg border-2 border-purple-300 bg-purple-50">
              <div className="flex items-start">
                <Server className="w-8 h-8 text-purple-700 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-purple-800 mb-4 leading-relaxed">
                    Our Google OAuth integration with Nodemailer enables automated email delivery for essential Platform communications. All emails are sent from official Bulls & Bears Finance Club email accounts and include:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Transactional Emails:</h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• Account verification and activation</li>
                        <li>• Password reset and security notifications</li>
                        <li>• Trading simulation confirmations</li>
                        <li>• System maintenance alerts</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Educational Communications:</h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• Learning progress reports</li>
                        <li>• Club event announcements</li>
                        <li>• Educational content updates</li>
                        <li>• Competition and challenge notifications</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-blue-600 pb-2">
              4. DATA SECURITY AND PROTECTION MEASURES
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-lg text-center bg-green-50 border-2 border-green-200">
                <Lock className="w-12 h-12 mx-auto mb-3 text-green-700" />
                <h4 className="text-lg font-bold text-green-800 mb-2">Encryption Standards</h4>
                <p className="text-sm text-green-700 leading-relaxed">
                  TLS 1.3 encryption for data transmission, AES-256 encryption for data storage, and secure API communications
                </p>
              </div>
              
              <div className="p-6 rounded-lg text-center bg-blue-50 border-2 border-blue-200">
                <Database className="w-12 h-12 mx-auto mb-3 text-blue-700" />
                <h4 className="text-lg font-bold text-blue-800 mb-2">Secure Infrastructure</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Protected cloud servers, regular security audits, automated backup systems, and intrusion detection
                </p>
              </div>
              
              <div className="p-6 rounded-lg text-center bg-purple-50 border-2 border-purple-200">
                <Shield className="w-12 h-12 mx-auto mb-3 text-purple-700" />
                <h4 className="text-lg font-bold text-purple-800 mb-2">Access Controls</h4>
                <p className="text-sm text-purple-700 leading-relaxed">
                  Multi-factor authentication, role-based permissions, regular access reviews, and audit logging
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              4.1 Google OAuth Security Implementation
            </h3>
            <div className="p-6 rounded-lg border border-orange-300 bg-orange-50">
              <p className="text-orange-800 mb-4 leading-relaxed">
                Our Google OAuth 2.0 implementation for Nodemailer follows industry best practices:
              </p>
              <ul className="text-orange-800 space-y-2">
                <li>• OAuth credentials stored in encrypted environment variables</li>
                <li>• Automatic token refresh and secure token management</li>
                <li>• Limited scope access (email sending only)</li>
                <li>• Regular credential rotation and security monitoring</li>
                <li>• Compliance with Google's OAuth 2.0 security requirements</li>
              </ul>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-blue-600 pb-2">
              5. INFORMATION SHARING AND DISCLOSURE
            </h2>
            
            <div className="p-8 rounded-lg border-2 border-red-500 bg-red-50 mb-6">
              <h3 className="text-2xl font-bold text-red-800 mb-4 flex items-center">
                <Shield className="w-8 h-8 mr-3" />
                STRICT NON-DISCLOSURE POLICY
              </h3>
              <p className="text-red-800 text-lg leading-relaxed mb-4">
                We maintain a strict policy of non-disclosure regarding personal information. Under no circumstances do we sell, rent, lease, or share personal information with third parties for commercial, marketing, or promotional purposes.
              </p>
              <p className="text-red-700 font-semibold">
                Your privacy and data security are our highest priorities.
              </p>
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              5.1 Limited Exceptions for Operational Necessity
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded border-l-4 border-gray-600">
                <h4 className="font-bold text-gray-800 mb-2">Aggregated Statistical Data:</h4>
                <p className="text-gray-700">Anonymized usage statistics for educational research and Platform improvement (no personally identifiable information included)</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded border-l-4 border-gray-600">
                <h4 className="font-bold text-gray-800 mb-2">Legal Compliance:</h4>
                <p className="text-gray-700">Disclosure required by applicable laws, court orders, or governmental regulations</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded border-l-4 border-gray-600">
                <h4 className="font-bold text-gray-800 mb-2">Safety and Security:</h4>
                <p className="text-gray-700">Protection of rights, property, or safety of users, the Platform, or the public</p>
              </div>

              <div className="p-4 bg-gray-50 rounded border-l-4 border-gray-600">
                <h4 className="font-bold text-gray-800 mb-2">University Compliance:</h4>
                <p className="text-gray-700">Adherence to PDEU policies, regulations, and educational requirements</p>
              </div>
            </div>
          </div>

          {/* User Rights */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-blue-600 pb-2">
              6. USER RIGHTS AND DATA CONTROL
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-lg bg-blue-50 border border-blue-200">
                <h3 className="text-xl font-bold mb-4 text-blue-900">
                  6.1 Data Access and Management Rights
                </h3>
                <ul className="space-y-3 text-blue-800">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span><strong>Access:</strong> Request complete copies of your personal data</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span><strong>Rectification:</strong> Correct inaccurate or incomplete information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span><strong>Erasure:</strong> Request deletion of your account and associated data</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span><strong>Portability:</strong> Export your simulation data in machine-readable format</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-green-50 border border-green-200">
                <h3 className="text-xl font-bold mb-4 text-green-900">
                  6.2 Communication and Email Controls
                </h3>
                <ul className="space-y-3 text-green-800">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span><strong>Unsubscribe:</strong> Opt out of non-essential email communications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span><strong>Preferences:</strong> Customize email notification settings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span><strong>Frequency:</strong> Control the frequency of educational updates</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span><strong>Support:</strong> Contact our team for additional privacy controls</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-6 rounded-lg border-2 border-yellow-400 bg-yellow-50">
              <h4 className="text-lg font-bold text-yellow-800 mb-2">Exercise Your Rights</h4>
              <p className="text-yellow-800">
                To exercise any of these rights, please contact us at <strong>privacy@bullsandbearspdeu.com</strong> with your request. We will respond within 30 days and verify your identity before processing any data requests.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-blue-600 pb-2">
              7. CONTACT INFORMATION AND DATA PROTECTION OFFICER
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-lg bg-gray-50 border border-gray-300">
                <h3 className="text-xl font-bold mb-6 text-gray-900">
                  Bulls & Bears Finance Club
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-6 h-6 mr-3 mt-1 text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">Physical Address:</p>
                      <p className="text-gray-700">Pandit Deendayal Energy University (PDEU)</p>
                      <p className="text-gray-700">Raisan Village, Gandhinagar - 382426</p>
                      <p className="text-gray-700">Gujarat, India</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="w-6 h-6 mr-3 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Privacy Inquiries:</p>
                      <p className="text-gray-700">privacy@bullsandbearspdeu.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="w-6 h-6 mr-3 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">General Support:</p>
                      <p className="text-gray-700">support@bullsandbearspdeu.com</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 rounded-lg bg-blue-50 border border-blue-300">
                <h3 className="text-xl font-bold mb-6 text-blue-900">
                  Official References and Documentation
                </h3>
                <div className="space-y-4">
                  <a
                    href="https://www.bullsandbearspdeu.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    <ExternalLink className="w-5 h-5 mr-3" />
                    Bulls & Bears Official Website
                  </a>
                  
                  <a
                    href="https://www.pdeu.ac.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    <ExternalLink className="w-5 h-5 mr-3" />
                    PDEU Official University Website
                  </a>
                  
                  <a
                    href="https://www.linkedin.com/in/bulls-and-bears-pdpu-536ba3175/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    <ExternalLink className="w-5 h-5 mr-3" />
                    Bulls & Bears LinkedIn Profile
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Compliance */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-blue-600 pb-2">
              8. LEGAL COMPLIANCE AND REGULATORY FRAMEWORK
            </h2>
            
            <div className="p-8 rounded-lg border-2 border-gray-400 bg-gray-50">
              <p className="text-gray-800 text-lg mb-6 leading-relaxed">
                This Privacy Policy and all data processing activities are governed by the laws of India and the state of Gujarat. We maintain strict compliance with:
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-white rounded border border-gray-300">
                  <h4 className="font-bold text-gray-800 mb-2">Indian Privacy Legislation:</h4>
                  <p className="text-gray-700">Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</p>
                </div>
                
                <div className="p-4 bg-white rounded border border-gray-300">
                  <h4 className="font-bold text-gray-800 mb-2">Emerging Data Protection Laws:</h4>
                  <p className="text-gray-700">Digital Personal Data Protection Act, 2023 (as implemented and applicable)</p>
                </div>
                
                <div className="p-4 bg-white rounded border border-gray-300">
                  <h4 className="font-bold text-gray-800 mb-2">International Security Standards:</h4>
                  <p className="text-gray-700">Google OAuth 2.0 Security Requirements and Best Practices</p>
                </div>
                
                <div className="p-4 bg-white rounded border border-gray-300">
                  <h4 className="font-bold text-gray-800 mb-2">Institutional Policies:</h4>
                  <p className="text-gray-700">PDEU Information Technology, Data Protection, and Student Privacy Policies</p>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Updates */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-blue-600 pb-2">
              9. POLICY AMENDMENTS AND UPDATES
            </h2>
            
            <p className="text-gray-800 text-lg mb-6 leading-relaxed">
              We reserve the right to modify, update, or revise this Privacy Policy to reflect changes in our practices, technology, legal requirements, or other operational factors. Material changes will be communicated through:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="p-6 bg-orange-50 rounded border border-orange-200">
                <h3 className="text-lg font-bold text-orange-800 mb-3">Notification Methods:</h3>
                <ul className="text-orange-700 space-y-2">
                  <li>• Prominent notice displayed on the Platform</li>
                  <li>• Email notification to all registered users</li>
                  <li>• Updated "Effective Date" notation</li>
                  <li>• Explicit acknowledgment requirement for significant changes</li>
                </ul>
              </div>
              
              <div className="p-6 bg-purple-50 rounded border border-purple-200">
                <h3 className="text-lg font-bold text-purple-800 mb-3">User Responsibilities:</h3>
                <ul className="text-purple-700 space-y-2">
                  <li>• Review updated policies promptly</li>
                  <li>• Contact us with questions or concerns</li>
                  <li>• Exercise opt-out rights if disagreeing with changes</li>
                  <li>• Maintain current contact information</li>
                </ul>
              </div>
            </div>
            
            <div className="p-6 rounded-lg border-2 border-red-400 bg-red-50">
              <p className="text-red-800 font-semibold text-lg">
                Continued use of the Platform following any changes constitutes acceptance of the updated Privacy Policy. If you disagree with modifications, you may discontinue use and request account deletion.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t-2 border-gray-400">
            <p className="text-lg font-bold text-gray-800 mb-2">
              © 2024 Bulls & Bears Finance Club
            </p>
            <p className="text-base text-gray-700 mb-2">
              Pandit Deendayal Energy University, Gandhinagar, Gujarat, India
            </p>
            <p className="text-sm text-gray-600 italic">
              This is an educational trading simulation platform. No real financial transactions, investments, or money management services are provided.
            </p>
            <div className="mt-6 pt-4 border-t border-gray-300">
              <p className="text-xs text-gray-500">
                Document Version: 2.0 | Last Reviewed: {currentDate} | Next Review: {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;