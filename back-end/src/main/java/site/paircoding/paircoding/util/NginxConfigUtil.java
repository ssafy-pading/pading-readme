package site.paircoding.paircoding.util;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import java.io.ByteArrayOutputStream;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NginxConfigUtil {

  @Value("${ssh.nginx-server.host}")
  private String SSH_HOST;

  @Value("${ssh.nginx-server.port}")
  private int SSH_PORT;

  @Value("${ssh.nginx-server.user}")
  private String SSH_USER;

  @Value("${ssh.nginx-server.password}")
  private String SSH_PASSWORD;

  @Value("${ssh.nginx-server.subdomain-prefix}")
  private String SUBDOMAIN_PREFIX;


  private static final String NGINX_AVAILABLE_PATH = "/etc/nginx/sites-available/";
  private static final String NGINX_ENABLED_PATH = "/etc/nginx/sites-enabled/";

  private Session getSession() throws JSchException {
    JSch jsch = new JSch();
    Session session = jsch.getSession(SSH_USER, SSH_HOST, SSH_PORT);
    session.setPassword(SSH_PASSWORD);
    session.setConfig("StrictHostKeyChecking", "no");
    session.connect();

    return session;
  }

  private String generateNginxConfigContent(String subdomain, int nodePort) {
    return """
        server {
            listen 80;
            server_name %s.pair-coding.site;
        
            location / {
                return 301 https://$host$request_uri;  # HTTP에서 HTTPS로 리다이렉트
            }
        }
        
        server {
            listen 443 ssl;
            server_name %s.pair-coding.site;
        
            ssl_certificate /etc/letsencrypt/live/pair-coding.site/fullchain.pem;
            ssl_certificate_key /etc/letsencrypt/live/pair-coding.site/privkey.pem;
        
            include /etc/letsencrypt/options-ssl-nginx.conf;  # managed by Certbot
            ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;    # managed by Certbot
        
            client_max_body_size 100M;
        
            location / {
                proxy_pass http://192.168.0.38:%d;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }
        }
        
        """.formatted(subdomain, subdomain, nodePort);
  }

  private void executeCommand(Session session, String command) throws Exception {

    ChannelExec channel = (ChannelExec) session.openChannel("exec");
    channel.setCommand(command);
    channel.setInputStream(null);
    channel.setErrStream(System.err);

    ByteArrayOutputStream responseStream = new ByteArrayOutputStream();
    channel.setOutputStream(responseStream);

    channel.connect();

    while (!channel.isClosed()) {
      Thread.sleep(100);
    }

    channel.disconnect();
  }

  public String createSubdomain(String deploymentName) {
    return SUBDOMAIN_PREFIX + deploymentName;
  }

  public void createNginxConfig(String subdomain, int nodePort) {
    Session session = null;

    String configFileName = subdomain + ".conf"; // Nginx 설정 파일명 변환
    String configFilePath = NGINX_AVAILABLE_PATH + configFileName;
    String configContent = generateNginxConfigContent(subdomain, nodePort);

    try {
      // SSH 연결
      session = getSession();

      // 설정 파일 생성
      String createConfigCommand = "echo '" + configContent + "' > " + configFilePath;
      executeCommand(session, createConfigCommand);

      // 심볼릭 링크 생성
      String linkCommand = "ln -s " + configFilePath + " " + NGINX_ENABLED_PATH + configFileName;
      executeCommand(session, linkCommand);

      // Nginx 재시작
      String reloadNginxCommand = "sudo nginx -s reload";
      executeCommand(session, reloadNginxCommand);

    } catch (Exception e) {
      e.printStackTrace();
    } finally {
      if (session != null) {
        session.disconnect();
      }
    }
  }

  public void deleteNginxConfig(String subdomain) {
    Session session = null;

    String configFileName = SUBDOMAIN_PREFIX + subdomain + ".conf"; // Nginx 설정 파일명 변환
    String configFilePath = NGINX_AVAILABLE_PATH + configFileName;

    try {
      // SSH 연결
      session = getSession();

      // 설정 파일 삭제
      String createConfigCommand = "rm " + configFilePath;
      executeCommand(session, createConfigCommand);

      // 심볼릭 링크 삭제
      String linkCommand = "rm " + NGINX_ENABLED_PATH + configFileName;
      executeCommand(session, linkCommand);

      // Nginx 재시작
      String reloadNginxCommand = "sudo nginx -s reload";
      executeCommand(session, reloadNginxCommand);

    } catch (Exception e) {
      e.printStackTrace();
    } finally {
      if (session != null) {
        session.disconnect();
      }
    }
  }
}
