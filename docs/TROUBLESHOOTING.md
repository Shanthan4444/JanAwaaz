# JanSetu Troubleshooting & FAQ Guide

---

## 1. Common Setup Questions

### Q: Port 5000 is already in use
**Solution**: Change `PORT=5001` in `backend/.env` and update `VITE_API_BASE_URL=http://localhost:5001/api` in `frontend/.env`.

### Q: CORS error in browser console
**Solution**: Ensure `CLIENT_URL=http://localhost:5173` is set in `backend/.env` and matching your Vite dev server port.

### Q: OTP code not receiving on mobile
**Solution**: For development mode, JanSetu uses dev OTP fallback code `123456`. Enter `123456` on the OTP verification screen.

---

## 2. Verification Commands

```bash
# Test Backend Health
curl http://localhost:5000/api/health

# Run Database Seed
npm run seed
```
