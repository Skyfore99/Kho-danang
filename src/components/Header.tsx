"use client";
export default function Header() {
  return (
    <header className="header">
      <h1 className="title">Kho Thành Phẩm</h1>

      <style jsx>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(0,0,0,0.03);
          box-shadow: var(--shadow-sm);
        }
        .title {
          font-size: 20px;
          font-weight: 900;
          color: var(--primary-blue);
          margin: 0;
        }
      `}</style>
    </header>
  );
}
