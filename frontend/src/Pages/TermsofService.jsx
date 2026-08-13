import React from "react";
import {
  Scale,
  Shield,
  BookOpen,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Lock,
  Mail,
  ExternalLink,
  Server,
  Database,
  Gavel,
  FileText,
  Clock,
  Smartphone,
} from "lucide-react";

const TermsofService = () => {
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
              <div className="p-4 rounded-full bg-red-100">
                <Scale className="w-12 h-12 text-red-700" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 text-gray-900 tracking-wide">
              TERMS OF SERVICE
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
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-red-600 pb-2">
              1. INTRODUCTION AND ACCEPTANCE
            </h2>
            <p className="mb-6 leading-relaxed text-gray-800 text-lg">
              These Terms of Service ("Terms", "Agreement") constitute a legally binding agreement between you ("User", "Student", "You") and the Bulls & Bears Finance Club ("Club", "We", "Us", "Our") of Pandit Deendayal Energy University (PDEU), Gandhinagar, Gujarat, India, governing your access to and use of the Bulls & Bears Trading Simulation Platform ("Platform", "Service", "Application").
            </p>
            <div className="p-6 rounded-lg border-2 border-amber-600 bg-amber-50">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-amber-700 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-lg text-amber-800 mb-2">
                    CRITICAL NOTICE: EDUCATIONAL SIMULATION ONLY
                  </p>
                  <p className="text-amber-800 leading-relaxed mb-4">
                    This Platform is exclusively an educational trading simulation utilizing virtual currency for learning purposes. NO REAL MONEY, actual investments, securities trading, or genuine financial transactions are conducted, facilitated, processed, or offered through this Platform.
                  </p>
                  <p className="text-amber-900 font-semibold">
                    By accessing or using this Platform, you acknowledge and agree to be bound by these Terms.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Description */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-red-600 pb-2">
              2. PLATFORM DESCRIPTION AND EDUCATIONAL PURPOSE
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="p-6 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center mb-4">
                  <BookOpen className="w-8 h-8 text-blue-700 mr-3" />
                  <h3 className="text-xl font-bold text-blue-900">Educational Objectives</h3>
                </div>
                <ul className="space-y-2 text-blue-800">
                  <li>• Teach fundamental financial market principles</li>
                  <li>• Develop trading strategy and risk management skills</li>
                  <li>• Provide hands-on experience with market simulation</li>
                  <li>• Foster financial literacy and analytical thinking</li>
                  <li>• Enable peer-to-peer learning and healthy competition</li>
                  <li>• Prepare students for real-world financial careers</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center mb-4">
                  <Users className="w-8 h-8 text-green-700 mr-3" />
                  <h3 className="text-xl font-bold text-green-900">Club Activities</h3>
                </div>
                <ul className="space-y-2 text-green-800">
                  <li>• Virtual trading competitions and challenges</li>
                  <li>• Educational workshops and seminars</li>
                  <li>• Market analysis and research projects</li>
                  <li>• Guest lectures from industry professionals</li>
                  <li>• Portfolio management simulation exercises</li>
                  <li>• Financial news and market trend discussions</li>
                </ul>
              </div>
            </div>

            <div className="p-6 rounded-lg border-2 border-green-500 bg-green-50">
              <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                <CheckCircle className="w-8 h-8 mr-3" />
                VIRTUAL CURRENCY SIMULATION
              </h3>
              <p className="text-green-800 text-lg leading-relaxed mb-4">
                All trading activities on this Platform use virtual currency and simulated market data. Students receive virtual funds to practice trading strategies without financial risk. No real monetary value, actual securities, or genuine financial instruments are involved in any capacity.
              </p>
              <p className="text-green-700 font-semibold">
                Virtual gains and losses have no real-world financial impact whatsoever.
              </p>
            </div>
          </div>

          {/* Google OAuth Integration */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-red-600 pb-2">
              3. GOOGLE OAUTH 2.0 INTEGRATION AND EMAIL SERVICES
            </h2>
            
            <div className="p-6 rounded-lg border-2 border-blue-300 bg-blue-50 mb-6">
              <div className="flex items-start">
                <Mail className="w-8 h-8 text-blue-700 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-blue-800 mb-4">Server-Side Email Integration</h3>
                  <p className="text-blue-800 mb-4 leading-relaxed text-lg">
                    Our Platform utilizes Google OAuth 2.0 exclusively for server-side email functionality through Nodemailer, NOT for user authentication or personal Google account access. This integration enables automated delivery of essential Platform communications.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="p-4 bg-blue-100 rounded border border-blue-200">
                      <h4 className="font-bold text-blue-900 mb-3">System-Generated Emails Include:</h4>
                      <ul className="text-blue-800 space-y-1 text-sm">
                        <li>• Account registration and verification</li>
                        <li>• Password reset and security alerts</li>
                        <li>• Trading simulation reports and summaries</li>
                        <li>• Educational content and learning progress</li>
                        <li>• Club event announcements and invitations</li>
                        <li>• Platform maintenance and update notifications</li>
                        <li>• Competition results and leaderboard updates</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-100 rounded border border-blue-200">
                      <h4 className="font-bold text-blue-900 mb-3">Technical Implementation:</h4>
                      <ul className="text-blue-800 space-y-1 text-sm">
                        <li>• OAuth credentials stored securely on servers</li>
                        <li>• No access to user Google accounts or data</li>
                        <li>• Automated email delivery only</li>
                        <li>• Compliance with Google security standards</li>
                        <li>• Regular credential rotation and monitoring</li>
                        <li>• TLS encryption for all communications</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-purple-300 bg-purple-50">
              <h3 className="text-xl font-bold text-purple-800 mb-3 flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                Data Protection and Security Assurance
              </h3>
              <p className="text-purple-800 leading-relaxed">
                Our Google OAuth implementation is strictly limited to email sending capabilities. We do not request, access, store, or process any personal Google account information, Gmail content, Google Drive files, or other Google services data. Your Google account privacy and security remain completely intact.
              </p>
            </div>
          </div>

          {/* User Responsibilities */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-red-600 pb-2">
              4. USER RESPONSIBILITIES AND ACCEPTABLE USE
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div className="p-6 rounded-lg bg-green-50 border border-green-200">
                <h3 className="text-xl font-bold mb-4 text-green-900 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Permitted Activities
                </h3>
                <ul className="space-y-2 text-green-800">
                  <li>• Participate in educational trading simulations</li>
                  <li>• Engage in club activities and competitions</li>
                  <li>• Access learning materials and resources</li>
                  <li>• Collaborate with fellow students respectfully</li>
                  <li>• Provide constructive feedback and suggestions</li>
                  <li>• Report technical issues or security concerns</li>
                  <li>• Customize account settings and preferences</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-red-50 border border-red-200">
                <h3 className="text-xl font-bold mb-4 text-red-900 flex items-center">
                  <XCircle className="w-6 h-6 mr-2" />
                  Prohibited Activities
                </h3>
                <ul className="space-y-2 text-red-800">
                  <li>• Attempting to access real trading platforms</li>
                  <li>• Sharing or selling account credentials</li>
                  <li>• Disrupting Platform operations or services</li>
                  <li>• Uploading malicious code or content</li>
                  <li>• Harassing, threatening, or abusing other users</li>
                  <li>• Violating university policies or regulations</li>
                  <li>• Misrepresenting simulation results as real</li>
                </ul>
              </div>
            </div>

            <div className="p-6 rounded-lg border-2 border-orange-400 bg-orange-50">
              <h3 className="text-xl font-bold text-orange-800 mb-4">Account Security and Authentication</h3>
              <p className="text-orange-800 mb-4 leading-relaxed">
                Users are responsible for maintaining the confidentiality and security of their account credentials. You must:
              </p>
              <ul className="text-orange-800 space-y-2">
                <li>• Use strong, unique passwords for your account</li>
                <li>• Never share login credentials with others</li>
                <li>• Immediately report suspected unauthorized access</li>
                <li>• Log out from shared or public computers</li>
                <li>• Keep your contact information current and accurate</li>
                <li>• Comply with all PDEU IT policies and guidelines</li>
              </ul>
            </div>
          </div>

          {/* Platform Availability */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-red-600 pb-2">
              5. PLATFORM AVAILABILITY AND TECHNICAL SUPPORT
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="p-6 rounded-lg text-center bg-blue-50 border border-blue-200">
                <Server className="w-12 h-12 mx-auto mb-3 text-blue-700" />
                <h4 className="text-lg font-bold text-blue-800 mb-2">Service Availability</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  We strive for maximum uptime but cannot guarantee continuous availability due to maintenance, updates, or technical issues
                </p>
              </div>
              
              <div className="p-6 rounded-lg text-center bg-green-50 border border-green-200">
                <Smartphone className="w-12 h-12 mx-auto mb-3 text-green-700" />
                <h4 className="text-lg font-bold text-green-800 mb-2">Multi-Platform Access</h4>
                <p className="text-sm text-green-700 leading-relaxed">
                  Platform accessible via web browsers, mobile devices, and tablets with responsive design optimization
                </p>
              </div>
              
              <div className="p-6 rounded-lg text-center bg-purple-50 border border-purple-200">
                <Database className="w-12 h-12 mx-auto mb-3 text-purple-700" />
                <h4 className="text-lg font-bold text-purple-800 mb-2">Data Backup</h4>
                <p className="text-sm text-purple-700 leading-relaxed">
                  Regular automated backups protect user data, but users should maintain personal records of important information
                </p>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-gray-400 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Planned Maintenance and Updates</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We reserve the right to temporarily suspend Platform access for:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="text-gray-700 space-y-2">
                  <li>• Scheduled system maintenance and upgrades</li>
                  <li>• Security patches and vulnerability fixes</li>
                  <li>• Feature enhancements and bug corrections</li>
                  <li>• Infrastructure improvements and scaling</li>
                </ul>
                <ul className="text-gray-700 space-y-2">
                  <li>• Database optimization and cleanup</li>
                  <li>• Third-party service integrations</li>
                  <li>• Compliance and regulatory updates</li>
                  <li>• Emergency security response measures</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-red-600 pb-2">
              6. INTELLECTUAL PROPERTY AND CONTENT OWNERSHIP
            </h2>
            
            <div className="p-6 rounded-lg border-2 border-indigo-400 bg-indigo-50 mb-6">
              <h3 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center">
                <FileText className="w-8 h-8 mr-3" />
                Platform Ownership and Rights
              </h3>
              <p className="text-indigo-800 mb-4 leading-relaxed text-lg">
                The Bulls & Bears Trading Simulation Platform, including all software, content, design elements, trademarks, logos, and intellectual property, is owned by the Bulls & Bears Finance Club of PDEU and protected by applicable intellectual property laws.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-indigo-900 mb-2">Protected Elements Include:</h4>
                  <ul className="text-indigo-800 space-y-1 text-sm">
                    <li>• Platform source code and architecture</li>
                    <li>• User interface design and layout</li>
                    <li>• Educational content and materials</li>
                    <li>• Trading simulation algorithms</li>
                    <li>• Bulls & Bears branding and logos</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-indigo-900 mb-2">Usage Restrictions:</h4>
                  <ul className="text-indigo-800 space-y-1 text-sm">
                    <li>• No copying, modification, or distribution</li>
                    <li>• No reverse engineering or decompilation</li>
                    <li>• No commercial use without permission</li>
                    <li>• No creation of derivative works</li>
                    <li>• Respect for all trademark rights</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-yellow-300 bg-yellow-50">
              <h3 className="text-xl font-bold text-yellow-800 mb-3">User-Generated Content</h3>
              <p className="text-yellow-800 leading-relaxed">
                By submitting content to the Platform (profiles, comments, feedback, suggestions), you grant the Bulls & Bears Finance Club a non-exclusive, royalty-free license to use, display, and modify such content for educational and Platform improvement purposes. You retain ownership of your original content but represent that you have the right to grant this license.
              </p>
            </div>
          </div>

          {/* Privacy and Data Protection */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-red-600 pb-2">
              7. PRIVACY, DATA PROTECTION, AND INFORMATION SECURITY
            </h2>
            
            <div className="p-6 rounded-lg border-2 border-green-400 bg-green-50 mb-6">
              <div className="flex items-start">
                <Lock className="w-8 h-8 text-green-700 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-green-800 mb-4">Comprehensive Privacy Protection</h3>
                  <p className="text-green-800 mb-4 leading-relaxed text-lg">
                    Your privacy and data security are our highest priorities. All personal information collection, processing, storage, and sharing practices are governed by our comprehensive Privacy Policy, which complies with Indian data protection laws and international security standards.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-100 rounded border border-green-200">
                      <h4 className="font-bold text-green-900 mb-2">Data Security Measures:</h4>
                      <ul className="text-green-800 space-y-1 text-sm">
                        <li>• End-to-end encryption (TLS 1.3)</li>
                        <li>• Secure cloud infrastructure</li>
                        <li>• Regular security audits and monitoring</li>
                        <li>• Access controls and authentication</li>
                        <li>• Automated backup and recovery systems</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-green-100 rounded border border-green-200">
                      <h4 className="font-bold text-green-900 mb-2">User Rights and Controls:</h4>
                      <ul className="text-green-800 space-y-1 text-sm">
                        <li>• Access and review personal data</li>
                        <li>• Correct inaccurate information</li>
                        <li>• Request data deletion</li>
                        <li>• Control email communications</li>
                        <li>• Export personal data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-blue-300 bg-blue-50">
              <h3 className="text-xl font-bold text-blue-800 mb-3">Data Retention and Deletion</h3>
              <p className="text-blue-800 mb-4 leading-relaxed">
                User data is retained only as long as necessary for educational purposes and Platform operations. Upon account deletion or graduation:
              </p>
              <ul className="text-blue-800 space-y-2">
                <li>• Personal information is securely deleted within 90 days</li>
                <li>• Anonymous usage statistics may be retained for research</li>
                <li>• Trading simulation history can be exported before deletion</li>
                <li>• Email communications cease immediately</li>
                <li>• Account access is permanently disabled</li>
              </ul>
            </div>
          </div>

          {/* Disclaimers and Limitations */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-red-600 pb-2">
              8. DISCLAIMERS, LIMITATIONS, AND RISK ACKNOWLEDGMENT
            </h2>
            
            <div className="p-8 rounded-lg border-2 border-red-500 bg-red-50 mb-6">
              <h3 className="text-2xl font-bold text-red-800 mb-4 flex items-center">
                <AlertTriangle className="w-8 h-8 mr-3" />
                IMPORTANT EDUCATIONAL DISCLAIMERS
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-red-100 rounded border border-red-300">
                  <p className="text-red-800 font-semibold text-lg mb-2">NO FINANCIAL ADVICE:</p>
                  <p className="text-red-700">
                    This Platform provides educational simulation only. Content does not constitute professional financial, investment, or trading advice. Do not base real financial decisions on simulation results.
                  </p>
                </div>
                
                <div className="p-4 bg-red-100 rounded border border-red-300">
                  <p className="text-red-800 font-semibold text-lg mb-2">SIMULATION LIMITATIONS:</p>
                  <p className="text-red-700">
                    Virtual trading results do not reflect real market conditions, transaction costs, liquidity constraints, or emotional factors that impact actual trading performance.
                  </p>
                </div>
                
                <div className="p-4 bg-red-100 rounded border border-red-300">
                  <p className="text-red-800 font-semibold text-lg mb-2">NO GUARANTEES:</p>
                  <p className="text-red-700">
                    We make no warranties regarding Platform accuracy, reliability, or educational outcomes. Users participate at their own discretion and responsibility.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg bg-orange-50 border border-orange-200">
                <h3 className="text-lg font-bold text-orange-800 mb-3">Limitation of Liability</h3>
                <p className="text-orange-700 text-sm leading-relaxed">
                  The Bulls & Bears Finance Club and PDEU shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from Platform use, including but not limited to data loss, system downtime, or educational outcomes. Maximum liability is limited to the extent permitted by law.
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-purple-50 border border-purple-200">
                <h3 className="text-lg font-bold text-purple-800 mb-3">Indemnification</h3>
                <p className="text-purple-700 text-sm leading-relaxed">
                  Users agree to indemnify and hold harmless the Bulls & Bears Finance Club, PDEU, and their affiliates from any claims, damages, or expenses arising from User's violation of these Terms, misuse of the Platform, or violation of any third-party rights.
                </p>
              </div>
            </div>
          </div>

          {/* Compliance and Legal */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-red-600 pb-2">
              9. LEGAL COMPLIANCE AND REGULATORY FRAMEWORK
            </h2>
            
            <div className="p-6 rounded-lg border-2 border-gray-500 bg-gray-50 mb-6">
              <div className="flex items-start">
                <Gavel className="w-8 h-8 text-gray-700 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Governing Law and Jurisdiction</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed text-lg">
                    These Terms are governed by the laws of India and the state of Gujarat. Any disputes shall be subject to the exclusive jurisdiction of the courts in Gandhinagar, Gujarat, India.
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded border border-gray-300">
                      <h4 className="font-bold text-gray-800 mb-2">Compliance Standards:</h4>
                      <ul className="text-gray-700 space-y-1 text-sm">
                        <li>• Indian Information Technology Act, 2000</li>
                        <li>• Digital Personal Data Protection Act, 2023</li>
                        <li>• PDEU Information Technology Policies</li>
                        <li>• Google OAuth 2.0 Security Requirements</li>
                        <li>• Educational Institution Data Protection Guidelines</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-blue-300 bg-blue-50">
              <h3 className="text-xl font-bold text-blue-800 mb-3">University Policy Integration</h3>
              <p className="text-blue-700 leading-relaxed">
                Platform usage is subject to all applicable PDEU policies, including but not limited to IT usage policies, student conduct codes, academic integrity standards, and disciplinary procedures. Violations may result in academic consequences in addition to Platform access restrictions.
              </p>
            </div>
          </div>

          {/* Account Termination */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-red-600 pb-2">
              10. ACCOUNT TERMINATION AND SUSPENSION
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="p-6 rounded-lg bg-yellow-50 border border-yellow-200">
                <h3 className="text-xl font-bold text-yellow-800 mb-4">User-Initiated Termination</h3>
                <ul className="text-yellow-700 space-y-2">
                  <li>• Request account deletion at any time</li>
                  <li>• Export personal data before termination</li>
                  <li>• 30-day grace period for data recovery</li>
                  <li>• Immediate cessation of email communications</li>
                  <li>• Loss of access to all Platform features</li>
                  <li>• Permanent deletion of virtual trading history</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-red-50 border border-red-200">
                <h3 className="text-xl font-bold text-red-800 mb-4">Club-Initiated Termination</h3>
                <ul className="text-red-700 space-y-2">
                  <li>• Violation of Terms of Service</li>
                  <li>• Inappropriate or abusive behavior</li>
                  <li>• Attempted security breaches</li>
                  <li>• University disciplinary actions</li>
                  <li>• Extended periods of inactivity</li>
                  <li>• Graduation or departure from PDEU</li>
                </ul>
              </div>
            </div>

            <div className="p-6 rounded-lg border-2 border-orange-400 bg-orange-50">
              <h3 className="text-xl font-bold text-orange-800 mb-3 flex items-center">
                <Clock className="w-6 h-6 mr-2" />
                Termination Process
              </h3>
              <p className="text-orange-700 mb-4 leading-relaxed">
                Account termination follows a structured process to ensure fairness and data protection:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-orange-100 rounded-full p-3 mx-auto mb-2 w-12 h-12 flex items-center justify-center">
                    <span className="font-bold text-orange-800">1</span>
                  </div>
                  <p className="text-sm text-orange-700 font-semibold">Notice Period</p>
                  <p className="text-xs text-orange-600">7-day warning for violations</p>
                </div>
                <div className="text-center">
                  <div className="bg-orange-100 rounded-full p-3 mx-auto mb-2 w-12 h-12 flex items-center justify-center">
                    <span className="font-bold text-orange-800">2</span>
                  </div>
                  <p className="text-sm text-orange-700 font-semibold">Data Export</p>
                  <p className="text-xs text-orange-600">30-day access for backup</p>
                </div>
                <div className="text-center">
                  <div className="bg-orange-100 rounded-full p-3 mx-auto mb-2 w-12 h-12 flex items-center justify-center">
                    <span className="font-bold text-orange-800">3</span>
                  </div>
                  <p className="text-sm text-orange-700 font-semibold">Final Deletion</p>
                  <p className="text-xs text-orange-600">Permanent data removal</p>
                </div>
              </div>
            </div>
          </div>

          {/* Updates and Modifications */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-red-600 pb-2">
              11. TERMS MODIFICATIONS AND UPDATES
            </h2>
            
            <div className="p-6 rounded-lg border-2 border-purple-400 bg-purple-50 mb-6">
              <h3 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
                <FileText className="w-8 h-8 mr-3" />
                Amendment Rights and Procedures
              </h3>
              <p className="text-purple-800 mb-4 leading-relaxed text-lg">
                We reserve the right to modify, update, or revise these Terms of Service at any time to reflect changes in Platform functionality, legal requirements, university policies, or operational procedures. Material changes will be communicated through multiple channels to ensure user awareness.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-purple-100 rounded border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-3">Notification Methods:</h4>
                  <ul className="text-purple-800 space-y-2 text-sm">
                    <li>• Prominent banner notice on Platform</li>
                    <li>• Email notification to all active users</li>
                    <li>• Updated "Effective Date" at document top</li>
                    <li>• In-app notification upon next login</li>
                    <li>• Club social media announcements</li>
                    <li>• PDEU official communication channels</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-purple-100 rounded border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-3">User Acceptance Process:</h4>
                  <ul className="text-purple-800 space-y-2 text-sm">
                    <li>• 30-day review period for major changes</li>
                    <li>• Explicit acceptance required for continued use</li>
                    <li>• Option to export data before acceptance</li>
                    <li>• Account termination right if disagreeing</li>
                    <li>• Support available for questions</li>
                    <li>• Version history maintained for reference</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-red-300 bg-red-50">
              <h3 className="text-xl font-bold text-red-800 mb-3">Continued Use Constitutes Acceptance</h3>
              <p className="text-red-700 leading-relaxed">
                By continuing to access and use the Platform following publication of updated Terms, you acknowledge that you have read, understood, and agree to be bound by the revised Terms. If you disagree with any modifications, you must discontinue Platform use and may request account deletion.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-red-600 pb-2">
              12. CONTACT INFORMATION AND SUPPORT
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-lg bg-gray-50 border border-gray-300">
                <h3 className="text-xl font-bold mb-6 text-gray-900">
                  Bulls & Bears Finance Club
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Globe className="w-6 h-6 mr-3 mt-1 text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">Institution:</p>
                      <p className="text-gray-700">Pandit Deendayal Energy University (PDEU)</p>
                      <p className="text-gray-700">Raisan Village, Gandhinagar - 382426</p>
                      <p className="text-gray-700">Gujarat, India</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="w-6 h-6 mr-3 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Legal Inquiries:</p>
                      <p className="text-gray-700">legal@bullsandbearspdeu.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="w-6 h-6 mr-3 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Technical Support:</p>
                      <p className="text-gray-700">support@bullsandbearspdeu.com</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail className="w-6 h-6 mr-3 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">General Information:</p>
                      <p className="text-gray-700">info@bullsandbearspdeu.com</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 rounded-lg bg-blue-50 border border-blue-300">
                <h3 className="text-xl font-bold mb-6 text-blue-900">
                  Official Resources and Links
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
                    href="https://bazaar-frontend-app.onrender.com/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    <ExternalLink className="w-5 h-5 mr-3" />
                    Privacy Policy
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

                  <div className="p-4 bg-blue-100 rounded border border-blue-200 mt-6">
                    <h4 className="font-semibold text-blue-900 mb-2">Support Response Times:</h4>
                    <ul className="text-blue-800 space-y-1 text-sm">
                      <li>• Technical Issues: 24-48 hours</li>
                      <li>• Account Problems: 1-2 business days</li>
                      <li>• Legal Inquiries: 3-5 business days</li>
                      <li>• General Questions: 1-3 business days</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Severability and Entire Agreement */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-red-600 pb-2">
              13. SEVERABILITY AND ENTIRE AGREEMENT
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg bg-gray-50 border border-gray-300">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Severability Clause</h3>
                <p className="text-gray-700 leading-relaxed">
                  If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be severed from these Terms, and the remaining provisions shall remain in full force and effect. Invalid provisions will be replaced with enforceable provisions that most closely reflect the original intent.
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-gray-50 border border-gray-300">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Entire Agreement</h3>
                <p className="text-gray-700 leading-relaxed">
                  These Terms of Service, together with our Privacy Policy and any additional policies referenced herein, constitute the entire agreement between you and the Bulls & Bears Finance Club regarding Platform use. These Terms supersede all prior or contemporaneous communications and proposals, whether oral or written.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-lg border-2 border-green-400 bg-green-50 mt-6">
              <h3 className="text-xl font-bold text-green-800 mb-3">Document Relationship</h3>
              <p className="text-green-700 mb-4 leading-relaxed">
                These Terms of Service work in conjunction with our Privacy Policy to provide comprehensive governance of Platform usage. Both documents are equally binding and should be read together for complete understanding of rights and obligations.
              </p>
              <ul className="text-green-700 space-y-2">
                <li>• Terms of Service: Usage rules, responsibilities, and legal framework</li>
                <li>• Privacy Policy: Data collection, processing, and protection practices</li>
                <li>• PDEU Policies: University-specific regulations and academic standards</li>
                <li>• Google OAuth Terms: Third-party service integration requirements</li>
              </ul>
            </div>
          </div>

          {/* Acknowledgment and Acceptance */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-red-600 pb-2">
              14. USER ACKNOWLEDGMENT AND ACCEPTANCE
            </h2>
            
            <div className="p-8 rounded-lg border-2 border-green-500 bg-green-50">
              <h3 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
                <CheckCircle className="w-8 h-8 mr-3" />
                BY USING THIS PLATFORM, YOU ACKNOWLEDGE THAT:
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-700 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-green-800">You have read and understood these Terms of Service in their entirety</p>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-700 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-green-800">You agree to be legally bound by all terms and conditions</p>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-700 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-green-800">You understand this is an educational simulation with virtual currency only</p>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-700 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-green-800">You are authorized to enter into this agreement</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-700 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-green-800">You will comply with all applicable laws and university policies</p>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-700 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-green-800">You understand the limitations and disclaimers outlined herein</p>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-700 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-green-800">You accept responsibility for maintaining account security</p>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-700 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-green-800">You consent to data processing as described in our Privacy Policy</p>
                  </div>
                </div>
              </div>
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
            <p className="text-sm text-gray-600 italic mb-4">
              Educational Trading Simulation Platform - No Real Financial Services Provided
            </p>
            <div className="p-4 bg-amber-50 rounded border border-amber-300 mb-4">
              <p className="text-amber-800 font-semibold text-sm">
                IMPORTANT: This platform uses virtual currency for educational purposes only. 
                No actual money, investments, or financial transactions are involved.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-300">
              <p className="text-xs text-gray-500">
                Document Version: 1.0 | Last Updated: {currentDate} | Next Review: {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} | Language: English
              </p>
              <p className="text-xs text-gray-500 mt-2">
                For questions about these Terms, contact legal@bullsandbearspdeu.com | 
                Technical support: support@bullsandbearspdeu.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsofService;