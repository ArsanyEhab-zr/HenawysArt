import { Component } from 'react';

/**
 * ErrorBoundary — Catches JavaScript errors anywhere in its child component tree
 * and renders a graceful fallback UI instead of a blank white screen.
 *
 * Why this exists:
 * Google Translate mutates the DOM directly which can corrupt React's virtual DOM
 * reconciliation, especially inside complex components like CartDrawer. This boundary
 * prevents the entire app from crashing when that happens.
 *
 * Usage: <ErrorBoundary><App /></ErrorBoundary>
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('🔴 ErrorBoundary caught an error:', error);
        console.error('📍 Component stack:', errorInfo.componentStack);
    }

    handleReload = () => {
        // Clear any corrupt state that Google Translate may have left behind
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    handleRecover = () => {
        // Try to recover without a full reload
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback or the one passed via props
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        fontFamily: "'Inter', 'Cairo', sans-serif",
                        padding: '24px',
                    }}
                >
                    <div
                        style={{
                            maxWidth: '440px',
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '24px',
                            padding: '48px 32px',
                            textAlign: 'center',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                        }}
                    >
                        {/* Animated icon */}
                        <div
                            style={{
                                width: '80px',
                                height: '80px',
                                margin: '0 auto 24px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '36px',
                                animation: 'pulse 2s infinite',
                            }}
                        >
                            ⚠️
                        </div>

                        <h1
                            style={{
                                color: '#f1f5f9',
                                fontSize: '24px',
                                fontWeight: '700',
                                margin: '0 0 12px',
                                lineHeight: '1.3',
                            }}
                        >
                            Something went wrong
                        </h1>

                        <p
                            style={{
                                color: '#94a3b8',
                                fontSize: '15px',
                                margin: '0 0 8px',
                                lineHeight: '1.6',
                            }}
                        >
                            حصل مشكلة غير متوقعة. لو كنت غيرت اللغة للعربي، جرب ترجع إنجليزي وتحاول تاني.
                        </p>

                        <p
                            style={{
                                color: '#64748b',
                                fontSize: '13px',
                                margin: '0 0 32px',
                                lineHeight: '1.5',
                            }}
                        >
                            An unexpected error occurred. If you recently switched to Arabic, try switching back to English.
                        </p>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={this.handleRecover}
                                style={{
                                    padding: '12px 28px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.08)',
                                    color: '#e2e8f0',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.background = 'rgba(255,255,255,0.15)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = 'rgba(255,255,255,0.08)';
                                }}
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleReload}
                                style={{
                                    padding: '12px 28px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(59,130,246,0.4)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(59,130,246,0.5)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(59,130,246,0.4)';
                                }}
                            >
                                Reload Page
                            </button>
                        </div>

                        {/* Error details (collapsed) */}
                        {this.state.error && (
                            <details
                                style={{
                                    marginTop: '28px',
                                    textAlign: 'left',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                }}
                            >
                                <summary
                                    style={{
                                        color: '#64748b',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                    }}
                                >
                                    Technical details
                                </summary>
                                <pre
                                    style={{
                                        color: '#ef4444',
                                        fontSize: '11px',
                                        marginTop: '8px',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        fontFamily: 'monospace',
                                        maxHeight: '120px',
                                        overflow: 'auto',
                                    }}
                                >
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>

                    <style>{`
                        @keyframes pulse {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.05); }
                        }
                    `}</style>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
