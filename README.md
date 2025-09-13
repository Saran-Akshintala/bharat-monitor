# 🧭 Bharat Monitor - Website & API Monitoring Tool

A comprehensive full-stack monitoring solution built with NestJS and Angular, featuring real-time website/API monitoring, multi-channel alerting, and advanced dashboard analytics.

## ✨ Features

### 🔍 **Monitoring & Analytics**
- **Real-time Monitoring**: Monitor websites and APIs with customizable intervals (1-60 minutes)
- **Response Time Tracking**: Historical response time charts and performance analytics
- **Status Code Validation**: Custom expected status codes and validation rules
- **Uptime Statistics**: Comprehensive uptime/downtime tracking and reporting
- **Dashboard Analytics**: Real-time charts, statistics, and visual indicators

### 🚨 **Multi-Channel Alerting**
- **Email Alerts**: SendGrid integration with customizable templates
- **WhatsApp Notifications**: Meta Cloud API integration for instant messaging
- **Slack Integration**: Webhook-based notifications to Slack channels
- **Microsoft Teams**: Direct notifications to Teams channels
- **Alert History**: Complete audit trail of all notifications sent
- **Smart Alerting**: Prevents spam with intelligent alert throttling

### 👥 **User Management & Security**
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin and User roles with different permissions
- **User Preferences**: Customizable alert settings per user
- **Secure API**: Protected endpoints with proper authorization

### 📊 **Reporting & Export**
- **CSV Reports**: Export monitor data and uptime statistics
- **PDF Reports**: Professional formatted reports (planned)
- **Historical Data**: 24/7 data retention and historical analysis
- **Custom Date Ranges**: Filter reports by specific time periods

### 🎨 **Modern UI/UX**
- **Angular Material Design**: Clean, responsive, and accessible interface
- **Real-time Updates**: Live dashboard with automatic data refresh
- **Mobile Responsive**: Works seamlessly on all device sizes
- **Dark/Light Theme**: User preference-based theming (planned)
- **Interactive Charts**: Chart.js powered visualizations

### 🐳 **DevOps Ready**
- **Docker Containerization**: Complete Docker setup for all services
- **Docker Compose**: One-command deployment setup
- **Nginx Reverse Proxy**: Production-ready web server configuration
- **Environment Configuration**: Flexible configuration management
- **Health Checks**: Built-in application health monitoring

## 🛠 Tech Stack

- **Backend**: NestJS, TypeScript, MongoDB, JWT Authentication
- **Frontend**: Angular 16+, Material Design, RxJS
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: Docker, Docker Compose, Nginx
- **Monitoring**: Cron jobs, Axios HTTP client

## 🎯 **Current Implementation Status**

### ✅ **Sprint 2 - Fully Completed**

#### **Backend Features**
- ✅ **Enhanced Monitoring Engine**: 5-minute cron jobs with concurrent HTTP checks
- ✅ **Multi-Channel Alert System**: Email, WhatsApp, Slack, Teams integration
- ✅ **Advanced Monitor Schema**: Response time thresholds, status validation, alert preferences
- ✅ **Alert Management**: Complete alert history, retry logic, and throttling
- ✅ **User Preferences**: Customizable alert channel settings per user
- ✅ **API Endpoints**: Monitor CRUD, alert history, dashboard statistics
- ✅ **Authentication**: JWT-based secure authentication with role management

#### **Frontend Features**
- ✅ **Interactive Dashboard**: Real-time charts, statistics, and monitor status
- ✅ **Alert Settings Page**: User preference management with toggle controls
- ✅ **Monitor Management**: Add/edit monitors with comprehensive form validation
- ✅ **Quick Login**: One-click admin/demo login for easy testing
- ✅ **Responsive Design**: Mobile-first Angular Material interface
- ✅ **Chart Visualizations**: Chart.js integration for response time trends
- ✅ **Alert History**: Complete audit trail with color-coded status indicators

#### **Infrastructure & DevOps**
- ✅ **Docker Containerization**: Complete multi-service Docker setup
- ✅ **Environment Configuration**: Comprehensive .env management
- ✅ **Database Seeding**: Rich mock data for testing and demonstration
- ✅ **CORS Configuration**: Proper cross-origin resource sharing setup
- ✅ **Production Ready**: Nginx reverse proxy and security headers

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (or Docker)
- Docker & Docker Compose (recommended)

### Option 1: Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/bharat-monitor.git
cd bharat-monitor

# Create environment file
cp backend/.env.example backend/.env

# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:4200
# Backend API: http://localhost:3000/api
# API Docs: http://localhost:3000/api/docs
```

### Option 2: Local Development Setup

1. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   cd ..
   ```

2. **Start MongoDB**
   ```bash
   # Using Docker (recommended)
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   
   # Or use local MongoDB installation
   mongod --dbpath /path/to/your/db
   ```

3. **Configure environment**
   ```bash
   # Copy and edit environment file
   cp backend/.env.example backend/.env
   # Edit backend/.env with your MongoDB URI and other settings
   ```

4. **Seed the database with demo data**
   ```bash
   cd backend
   npm run seed
   npm run seed:comprehensive  # For rich demo data
   ```

5. **Start the applications**
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run start:dev
   
   # Terminal 2: Start frontend
   cd frontend
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000/api
   - Swagger Docs: http://localhost:3000/api/docs

## Demo Credentials

### Admin User (Full Access)
```
Email: admin@bharatmonitor.com
Password: Admin@123
```

### Demo User (Standard User)
```
Email: demo@bharatmonitor.com
Password: Demo@123
```

### Test User (Standard User)
```
Email: test@bharatmonitor.com
Password: Test@123
```

## Access Points

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api/docs

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/bharat-monitor` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `PORT` | Server port | `3000` |
| `SENDGRID_API_KEY` | SendGrid API key for emails | Optional |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Cloud API token | Optional |
| `SLACK_WEBHOOK_URL` | Slack webhook URL | Optional |
| `TEAMS_WEBHOOK_URL` | Teams webhook URL | Optional |

### Alert Configuration

1. **Email Alerts (SendGrid)**
   - Sign up at [SendGrid](https://sendgrid.com)
   - Get API key and set `SENDGRID_API_KEY`
   - Configure `FROM_EMAIL`

2. **WhatsApp Alerts**
   - Set up WhatsApp Cloud API
   - Configure `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`

3. **Slack Alerts**
   - Create Slack webhook URL
   - Set `SLACK_WEBHOOK_URL` or configure per user

4. **Teams Alerts**
   - Create Teams webhook URL
   - Set `TEAMS_WEBHOOK_URL` or configure per user

## 📊 API Documentation

The API is fully documented with Swagger. Access it at:
- **Local**: http://localhost:3000/api/docs
- **Production**: https://your-domain.com/api/docs

### Key Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/monitors` - Get user monitors
- `POST /api/monitors` - Create new monitor
- `GET /api/monitors/dashboard` - Dashboard statistics
- `GET /api/alerts` - Get user alerts
- `GET /api/reports/uptime/csv` - Download CSV report

## 🏗️ Architecture

### Backend Structure
```
src/
├── auth/           # Authentication module
├── users/          # User management
├── monitoring/     # Monitor CRUD & engine
├── alerts/         # Alert system
├── reports/        # Report generation
├── schemas/        # MongoDB schemas
└── scripts/        # Utility scripts
```

### Frontend Structure
```
src/app/
├── auth/           # Login/Register components
├── core/           # Services, guards, interceptors
├── dashboard/      # Dashboard component
├── monitors/       # Monitor management
├── alerts/         # Alert history
├── reports/        # Report generation
├── settings/       # User settings
└── layout/         # Main layout component
```

## 🧪 Testing

```bash
# Backend unit tests
npm run test

# Backend e2e tests
npm run test:e2e

# Frontend tests
cd frontend
npm run test
```

## 🚀 Deployment

### Docker Production Deployment

1. **Build and deploy**
   ```bash
   docker-compose up -d
   ```

2. **Configure reverse proxy** (nginx example included)

3. **Set up SSL certificates**

4. **Configure monitoring and logging**

### Manual Production Deployment

1. **Build applications**
   ```bash
   npm run build
   cd frontend && npm run build
   ```

2. **Configure process manager** (PM2 recommended)
   ```bash
   npm install -g pm2
   pm2 start dist/main.js --name "bharat-monitor"
   ```

3. **Set up reverse proxy** (nginx/Apache)

4. **Configure SSL and security headers**

## 🔧 Development

### Adding New Monitor Types

1. Update `MonitorType` enum in `src/schemas/monitor.schema.ts`
2. Modify monitoring engine logic in `src/monitoring/monitoring-engine.service.ts`
3. Update frontend forms and validation

### Adding New Alert Channels

1. Create new alert type in `src/schemas/alert.schema.ts`
2. Implement sender method in `src/alerts/alerts.service.ts`
3. Add UI configuration in frontend settings

### Database Migrations

```bash
# Create migration script in src/scripts/
npm run migration:create <name>

# Run migrations
npm run migration:run
```

## 📈 Monitoring & Observability

- **Health Check**: `GET /api/health`
- **Metrics**: Built-in performance monitoring
- **Logs**: Structured logging with Winston
- **Alerts**: System-level monitoring alerts

## 🔒 Security Features

- JWT authentication with secure headers
- Input validation and sanitization
- Rate limiting on authentication endpoints
- CORS configuration
- Helmet.js security headers
- MongoDB injection protection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/api/docs` endpoint
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics and insights
- [ ] Custom alert rules and conditions
- [ ] Integration with monitoring tools (Grafana, Prometheus)
- [ ] Multi-tenant support
- [ ] Advanced reporting with custom date ranges
- [ ] Webhook integrations for custom notifications

---

**Built with ❤️ using the MEAN Stack**
