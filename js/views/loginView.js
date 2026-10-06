/**
 * JurisCore - Login View
 * Split-screen interface with legal-tech branding, 3D card depth, and demo quick-fill.
 */

import { Icons, Toast } from '../components.js';

export function renderLoginView(container, onLoginSuccess) {
  container.innerHTML = `
    <div class="login-screen-wrapper view-fade-enter">
      <!-- Left Branding Panel -->
      <div class="login-brand-panel">
        <div class="login-brand-header">
          <div class="brand-symbol-circle">
            ${Icons.scale}
          </div>
          <div class="brand-text-lockup">
            <h1>JurisCore</h1>
            <span>Legal Operations Cloud</span>
          </div>
        </div>

        <div class="login-brand-hero">
          <div class="login-badge-pill">
            <span class="login-badge-pill-dot"></span>
            Enterprise Legal Management Platform
          </div>
          <h2 class="login-hero-headline">
            Manage every case.<br/>
            With <em>complete clarity</em>.
          </h2>
          <p class="login-hero-subtext">
            The next-generation intelligence console designed for modern law firms, senior partners, and judicial workflows.
          </p>
        </div>

        <div class="login-brand-footer">
          <span>&copy; 2026 JurisCore Systems Inc.</span>
          <div class="login-cert-list">
            <div class="login-cert-item">
              ${Icons.shield}
              <span>SOC-2 Certified</span>
            </div>
            <div class="login-cert-item">
              ${Icons.check}
              <span>256-Bit TLS</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Login Card Panel -->
      <div class="login-form-panel">
        <div class="login-card-3d">
          <div class="login-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to access your firm's docket and client dossiers.</p>
          </div>

          <div class="login-demo-bar">
            <span>Demo: <strong>admin@juriscore.law</strong></span>
            <button type="button" class="login-demo-fill-btn" id="login-fill-demo-btn">Auto-Fill Credentials</button>
          </div>

          <form id="login-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="login-email">Official Email <span class="required">*</span></label>
              <input 
                type="email" 
                id="login-email" 
                class="form-input" 
                placeholder="partner@lawfirm.com" 
                value="admin@juriscore.law"
                required
                autocomplete="email"
              />
              <div class="form-error-msg" id="login-email-error">Please enter a valid legal account email.</div>
            </div>

            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="form-label" for="login-password" style="margin-bottom: 0;">Password <span class="required">*</span></label>
                <a href="javascript:void(0)" id="login-forgot-link" style="font-size: 12px; color: var(--brand-accent); text-decoration: none; font-weight: 500;">Forgot password?</a>
              </div>
              <input 
                type="password" 
                id="login-password" 
                class="form-input" 
                placeholder="••••••••••••" 
                value="JurisCore2026!"
                required
                autocomplete="current-password"
              />
              <div class="form-error-msg" id="login-password-error">Password must contain at least 6 characters.</div>
            </div>

            <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
              <label class="form-checkbox-label">
                <input type="checkbox" id="login-remember" class="form-checkbox" checked />
                <span>Keep me signed in for 30 days</span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary" id="login-submit-btn" style="width: 100%; padding: 12px; margin-top: 8px;">
              <span>Sign in to Dashboard</span>
              ${Icons.trendUp}
            </button>
          </form>

          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-subtle); text-align: center; font-size: 12.5px; color: var(--text-muted);">
            Need support onboarding your associates? <a href="mailto:support@juriscore.law" style="color: var(--brand-accent); font-weight: 600; text-decoration: none;">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event handlers
  const form = container.querySelector('#login-form');
  const emailInput = container.querySelector('#login-email');
  const passwordInput = container.querySelector('#login-password');
  const emailError = container.querySelector('#login-email-error');
  const passwordError = container.querySelector('#login-password-error');
  const fillDemoBtn = container.querySelector('#login-fill-demo-btn');
  const forgotLink = container.querySelector('#login-forgot-link');
  const submitBtn = container.querySelector('#login-submit-btn');

  fillDemoBtn.onclick = () => {
    emailInput.value = 'admin@juriscore.law';
    passwordInput.value = 'JurisCore2026!';
    emailInput.classList.remove('is-invalid');
    passwordInput.classList.remove('is-invalid');
    emailError.classList.remove('visible');
    passwordError.classList.remove('visible');
    Toast.info('Credentials Loaded', 'Pre-filled demo credentials for Managing Partner.');
  };

  forgotLink.onclick = () => {
    Toast.info('Password Assistance', 'In this project demo, use default credentials: admin@juriscore.law / JurisCore2026!');
  };

  form.onsubmit = (e) => {
    e.preventDefault();
    let valid = true;

    if (!emailInput.value.includes('@') || emailInput.value.trim().length < 5) {
      emailInput.classList.add('is-invalid');
      emailError.classList.add('visible');
      valid = false;
    } else {
      emailInput.classList.remove('is-invalid');
      emailError.classList.remove('visible');
    }

    if (passwordInput.value.length < 4) {
      passwordInput.classList.add('is-invalid');
      passwordError.classList.add('visible');
      valid = false;
    } else {
      passwordInput.classList.remove('is-invalid');
      passwordError.classList.remove('visible');
    }

    if (!valid) return;

    // Show button loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="loading-spinner" style="width: 16px; height: 16px; border-width: 2px;"></span> <span>Verifying credentials...</span>`;

    setTimeout(() => {
      Toast.success('Authentication Approved', 'Welcome back, Eleanor Vance (Managing Partner)');
      onLoginSuccess({
        name: 'Eleanor Vance, Esq.',
        email: emailInput.value,
        role: 'Managing Partner'
      });
    }, 450);
  };
}
